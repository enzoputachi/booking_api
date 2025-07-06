import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  loginUser,
  updateUser,
} from "../services/userService.js";

const handleCreateUser = async (req, res) => {
  const validatedUserData = req.body;
  try {
    
    const user = await createUser(validatedUserData);
    console.log("User created successfully:", user);
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

const handleLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    res.status(200).json({
      message: "User successfully logged in",
      status: "success",
      data: user,
    });
  } catch (error) {
    console.error(`Error logging in user: `, error?.user?.data || error.message);
    res
      .status(500)
      .json({
        message: "User login failed:",
        error: error?.user?.data || error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
}

const handleGetAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      message: "User successfully fetched",
      status: "success",
      data: users,
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

const handleGetUserById = async (req, res) => {
  try {
    const userId =  req.params.userId;
    const user = await getUserById( userId );
    
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
    const userId =  req.params.userId;
    const updatedData = req.body;

    const updatedUser = await updateUser(updatedData, userId);
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
    const userId =  req.params.userId;


    const deletedUser = await deleteUser(userId);
    res.status(200).json({
      message: "User successfully deleted",
      status: "success",
      data: deletedUser,
    });
  } catch (error) {
    console.error(`Error deleting user: `, error.message);
    res
      .status(500)
      .json({
        message: "Error deleting user:",
        error: error.message,
      });
    // throw new Error('Failed to create user', error?.response?.data || error.message)
  }
};

export {
  handleCreateUser,
  handleLoginUser,
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUser,
  handleDeleteUser,
};
