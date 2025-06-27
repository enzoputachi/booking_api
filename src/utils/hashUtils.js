import bcrypt from "bcryptjs";

export const hashPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export const comparePassword = async(inputPassword, hashPassword) => {
    return bcrypt.compare(inputPassword, hashPassword);
}