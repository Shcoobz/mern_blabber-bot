"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.userSignup = userSignup;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.verifyUser = verifyUser;
exports.getUserData = getUserData;
const cookie_manager_js_1 = require("../utils/cookie-manager.js");
const constants_js_1 = require("../constants/constants.js");
const user_handler_js_1 = require("./user-handler.js");
const User_js_1 = __importDefault(require("../models/User.js"));
/**
 * Fetches all users from the database.
 */
async function getAllUsers(req, res, next) {
    try {
        const users = await User_js_1.default.find();
        const successResponse = (0, user_handler_js_1.sendSuccessResponse)(res, { users });
        return successResponse;
    }
    catch (error) {
        console.log(error);
        const errorResponse = (0, user_handler_js_1.sendErrorResponse)(res, error);
        return errorResponse;
    }
}
/**
 * Handles the user signup process.
 */
async function userSignup(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (await (0, user_handler_js_1.checkUserExists)(email, res, true, false)) {
            return;
        }
        const newUser = await (0, user_handler_js_1.createAndSaveUser)(name, email, password);
        (0, cookie_manager_js_1.handleUserCookie)(res, newUser);
        const successResponse = (0, user_handler_js_1.sendSuccessResponse)(res, {
            message: constants_js_1.SUCCESS.USER.REGISTRATION,
            name: newUser.name,
            email: newUser.email,
        }, 201);
        return successResponse;
    }
    catch (error) {
        console.log(error);
        const errorResponse = (0, user_handler_js_1.sendErrorResponse)(res, error);
        return errorResponse;
    }
}
/**
 * Handles the user login process.
 */
// export async function userLogin(req: Request, res: Response, next: NextFunction) {
//   try {
//     console.log('Login request received:', req.body);
//     const { email, password } = req.body;
//     const user = await checkUserExists(email, false, false);
//     console.log('Login attempt for email:', email);
//     console.log('User found:', !!user);
//     if (!user) {
//       console.log('User not found, sending error response.');
//       return sendErrorResponse(res, new Error('User not found'), 404);
//     }
//     // Validate password once
//     const passwordIsValid = await validatePassword(password, user.password);
//     console.log('Password validation result:', passwordIsValid);
//     if (!passwordIsValid) {
//       console.log('Invalid password, sending error response.');
//       return sendErrorResponse(res, new Error('Invalid password'), 401);
//     }
//     handleUserCookie(res, user);
//     const successResponse = sendSuccessResponse(res, {
//       message: SUCCESS.USER.LOGIN,
//       name: user.name,
//       email: user.email,
//     });
//     return successResponse;
//   } catch (error) {
//     console.log(error);
//     const errorResponse = sendErrorResponse(res, error);
//     return errorResponse;
//   }
// }
async function userLogin(req, res, next) {
    try {
        console.log('Login request received:', req.body);
        const { email, password } = req.body;
        const user = await (0, user_handler_js_1.checkUserExists)(email, false, false);
        console.log('Login attempt for email:', email);
        console.log('User found:', !!user);
        await (0, user_handler_js_1.validatePassword)(password, user.password);
        console.log('Password validated successfully');
        (0, cookie_manager_js_1.handleUserCookie)(res, user);
        return (0, user_handler_js_1.sendSuccessResponse)(res, {
            message: constants_js_1.SUCCESS.USER.LOGIN,
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        console.log(error);
        return (0, user_handler_js_1.sendErrorResponse)(res, error, error.message === constants_js_1.ERROR.USER.UNAUTHORIZED ? 401 : 500);
    }
}
/**
 * Handles the user logout process.
 */
async function userLogout(req, res, next) {
    try {
        const user = await (0, user_handler_js_1.checkUserExists)(res.locals.jwtData.id, res, false, true);
        if (!user)
            return;
        if (!(0, user_handler_js_1.checkUserPermissions)(user, res.locals.jwtData.id, res)) {
            return;
        }
        (0, cookie_manager_js_1.deleteCookie)(res);
        const successResponse = (0, user_handler_js_1.sendSuccessResponse)(res, {
            message: constants_js_1.SUCCESS.USER.LOGOUT,
            name: user.name,
            email: user.email,
        });
        return successResponse;
    }
    catch (error) {
        console.log(error);
        const errorResponse = (0, user_handler_js_1.sendErrorResponse)(res, error);
        return errorResponse;
    }
}
/**
 * Verifies if the user is authenticated based on the JWT data.
 */
async function verifyUser(req, res, next) {
    try {
        const user = await (0, user_handler_js_1.checkUserExists)(res.locals.jwtData.id, res, false, true);
        if (!user)
            return;
        if (!(0, user_handler_js_1.checkUserPermissions)(user, res.locals.jwtData.id, res)) {
            return;
        }
        const successResponse = (0, user_handler_js_1.sendSuccessResponse)(res, {
            isAuthenticated: true,
        });
        return successResponse;
    }
    catch (error) {
        console.log(error);
        const errorResponse = (0, user_handler_js_1.sendErrorResponse)(res, error);
        return errorResponse;
    }
}
/**
 * Retrieves user data and sends a success response with user email and name.
 */
async function getUserData(req, res) {
    try {
        const user = await (0, user_handler_js_1.checkUserExists)(res.locals.jwtData.id, res, false, true);
        if (!user)
            return;
        const successResponse = (0, user_handler_js_1.sendSuccessResponse)(res, {
            email: user.email,
            name: user.name,
        });
        return successResponse;
    }
    catch (error) {
        console.error(error);
        const errorResponse = (0, user_handler_js_1.sendErrorResponse)(res, error);
        return errorResponse;
    }
}
//# sourceMappingURL=user-controllers.js.map