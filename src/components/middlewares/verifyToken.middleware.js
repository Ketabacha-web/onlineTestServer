// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";

// Define the verifyToken middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log(token);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    const { exp } = decoded;
    // console.log(decoded);
    // if (exp * 1000 < Date.now()) {
    //   return res.status(401).json({ message: "Token expired" });
    // }
    req.user = decoded;
    next();
  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token expired" });
      } else {
        console.error(error.message);
        return res.status(401).json({ message: "Invalid token" });
      }
    // return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;

// Example routes that require authentication and authorization

// app.get("/protected", verifyToken, (req, res) => {
//   res.json({ message: "This is a protected route" });
// });

// app.post("/api/create-post", verifyToken, (req, res) => {
//   // Only authenticated and authorized users can create posts
//   // ...
// });

// app.put("/api/edit-post/:id", verifyToken, (req, res) => {
//   // Only authenticated and authorized users can edit posts
//   // ...
// });

// // Example route that doesn't require authentication or authorization
// app.get("/public", (req, res) => {
//   res.json({ message: "This is a public route" });
// });

// // Start the server
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
