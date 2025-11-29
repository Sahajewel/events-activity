// import { Request, Response } from "express";
// import catchAsync from "../../shared/asyncHandler";
// import { UserService } from "./user.service";
// import ApiResponse from "../../shared/apiResponse";

// const createUser = catchAsync(async (req: Request, res: Response) => {
//   let { password, email } = req.body;
//   const profileImage = req.file?.path;
//   const userData = { password, email, profileImage };

//   const newUser = await UserService.createUser(userData);

//   ApiResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "User created successfully",
//     data: newUser,
//   });
// });

// export const UserController = {
//   createUser,
// };
