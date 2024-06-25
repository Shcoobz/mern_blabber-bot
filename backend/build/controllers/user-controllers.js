import { compare } from 'bcrypt';
import { deleteCookie, handleUserCookie } from '../utils/cookie-manager.js';
import User from '../models/User.js';
import { checkUserExists, createAndSaveUser, sendErrorResponse, sendSuccessResponse, } from './user-handler.js';
import { SUCCESS } from '../constants/constants.js';
/**
 * Fetches all users from the database.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} - A response with all users or an error message.
 */
export async function getAllUsers(req, res, next) {
    try {
        const users = await User.find();
        return sendSuccessResponse(res, { users });
    }
    catch (error) {
        console.log(error);
        return sendErrorResponse(res, error);
    }
}
/**
 * Handles the user signup process.
 * @param {Request} req - The request object containing the user details.
 * @param {Response} res - The response object used to send the response.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export async function userSignup(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (await checkUserExists(email, res)) {
            return;
        }
        const newUser = await createAndSaveUser(name, email, password);
        handleUserCookie(res, newUser);
        return sendSuccessResponse(res, {
            message: SUCCESS.USER.REGISTRATION,
            name: newUser.name,
            email: newUser.email,
        }, 201);
    }
    catch (error) {
        console.log(error);
        return sendErrorResponse(res, error);
    }
}
// export async function userSignup(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(409).send('User already registered!');
//     const hashedPassword = await hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();
//     handleUserCookie(res, user);
//     return res
//       .status(201)
//       .json({ message: 'Successfully registered!', name: user.name, email: user.email });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Error', cause: error.message });
//   }
// }
export async function userLogin(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('User not registered!');
        }
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).send('Incorrect Password!');
        }
        handleUserCookie(res, user);
        return res
            .status(200)
            .json({ message: 'Successfully logged in!', name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
}
export async function userLogout(req, res, next) {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send('User not registered or token malfunction!');
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(403).send("Permissions didn't match!");
        }
        deleteCookie(res);
        return res
            .status(200)
            .json({ message: 'User verified!', name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
}
export async function verifyUser(req, res, next) {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ isAuthenticated: false });
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(403).json({ isAuthenticated: false });
        }
        return res.status(200).json({ isAuthenticated: true });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error', cause: error.message });
    }
}
export async function getUserData(req, res) {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ email: user.email, name: user.name });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}
//# sourceMappingURL=user-controllers.js.map