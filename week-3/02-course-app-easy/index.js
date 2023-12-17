const express = require("express");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin authentication failed!" });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: "User authentication failed!" });
  }
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).send("Admin already exist!");
  } else {
    ADMINS.push(admin);
    res.json({ message: "Admin created successfully!" });
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ message: "Logged in successfully" });
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  const course = req.body;
  course.id = Date.now();
  COURSES.push(course);
  res.json({ message: "Course created successfully!" });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(403).send({ message: "Course not found" });
  }
});

app.get("/admin/courses", (req, res) => {
  res.json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: [],
  };
  const existingUser = USERS.find((u) => u.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: "User already exists!" });
  } else {
    USERS.push(user);
    res.json({ message: "User created successfully" });
  }
});

app.post("/users/login", userAuthentication, (req, res) => {
  res.json({ message: "Logged in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  res.json({ courses: COURSES.filter((c) => c.published) });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId && c.published);
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.status(404).send({ message: "Course not found!" });
  }
});

app.get("/users/purchasedCourses", (req, res) => {
  const courses = COURSES.filter((c) =>
    req.user.purchasedCourses.includes(c.id)
  );
  res.json({ purchasedCourses: courses });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
