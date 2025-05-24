import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "../services/userService.js";

const handleCreateUser = async (req, res) => {
  try {
    const validatedUserData = req.body;
    const user = await createUser(validatedUserData);
    res.status(200).json({
      message: "User successfully created",
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(`Error creating user: `, error?.user?.data || error.message);
    res
      .status(500)
      .json({
        message: "User creation failed:",
        error: error?.user?.data || error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
};

const handleGetUser = async (req, res) => {
  try {
    const validatedUserData = req.body;
    const user = await getUser(validatedUserData);
    res.status(200).json({
      message: "User successfully fetched",
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(`Error fetching user: `, error?.user?.data || error.message);
    res
      .status(500)
      .json({
        message: "Error fetching user:",
        error: error?.user?.data || error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
};

const handleUpdateUser = async (req, res) => {
  try {
    const validatedUserData = req.body;
    const updatedUser = await updateUser(validatedUserData);
    res.status(200).json({
      message: "User successfully updated",
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      `Error updating user: `,
      error?.updateUser?.data || error.message
    );
    res
      .status(500)
      .json({
        message: "Error updating user:",
        error: error?.updateUser?.data || error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
};

const handleDeleteUser = async (req, res) => {
  try {
    const validatedUserData = req.body;
    const user = await deleteUser(validatedUserData);
    res.status(200).json({
      message: "User successfully deleted",
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(`Error deleting user: `, error?.user?.data || error.message);
    res
      .status(500)
      .json({
        message: "Error deleting user:",
        error: error?.user?.data || error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
};

export { handleCreateUser, handleGetUser, handleUpdateUser, handleDeleteUser };
