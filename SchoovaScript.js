// Copy this entire file into your SchoovaMate JavaScript file.

/* =========================================================

   SCHOOVAMATE — SCHOOL TASK TRACKER

   Works with SchoovaMate HTML and CSS

   Prototype storage: localStorage

\========================================================= */



"use strict";



/* =========================================================

   HELPERS AND STORAGE

\========================================================= */



const $ = (id) => document.getElementById(id);

const $$ = (selector) => [...document.querySelectorAll(selector)];



const STORAGE = {

  users: "schoovaAccounts",

  tasks: "schoovaTasks",

  announcements: "schoovaAnnouncements",

  currentUser: "schoovaCurrentUser",

  rememberedId: "schoovaRememberedId"

};



const SECTIONS = ["ICT Honesty", "ICT Fidelity"];



const TASK_TYPES = [

  "Assignment",

  "Project",

  "Quiz",

  "Activity",

  "Research",

  "Other"

];



let currentUser = null;

let currentView = "overview";

let selectedStudentSection = "ICT Honesty";

let editingTaskId = null;

let toastTimer = null;



function readStorage(key, fallback = []) {

  try {

    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : fallback;

  } catch (error) {

    console.error("Storage read error:", key, error);

    return fallback;

  }

}



function writeStorage(key, value) {

  try {

    localStorage.setItem(key, JSON.stringify(value));

    return true;

  } catch (error) {

    console.error("Storage write error:", key, error);

    showToast("Unable to save. Storage may be full.", "error");

    return false;

  }

}



function getUsers() {

  return readStorage(STORAGE.users, []);

}



function saveUsers(users) {

  return writeStorage(STORAGE.users, users);

}



function getTasks() {

  return readStorage(STORAGE.tasks, []);

}



function saveTasks(tasks) {

  return writeStorage(STORAGE.tasks, tasks);

}



function getAnnouncements() {

  return readStorage(STORAGE.announcements, []);

}



function saveAnnouncements(items) {

  return writeStorage(STORAGE.announcements, items);

}



function makeId() {

  return (

    Date.now().toString(36) +

    Math.random().toString(36).slice(2, 9)

  );

}



function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, (character) => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#39;"

  })[character]);

}



function formatDate(value) {

  if (!value) return "No date";



  const date = new Date(`${value}T00:00:00`);



  if (Number.isNaN(date.getTime())) return value;



  return date.toLocaleDateString("en-PH", {

    year: "numeric",

    month: "short",

    day: "numeric"

  });

}



function todayString() {

  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");



  return `${year}-${month}-${day}`;

}



function showToast(message, type = "success") {

  const toast = $("toast");

  if (!toast) return;



  toast.textContent = message;

  toast.className = `toast show ${type}`;



  clearTimeout(toastTimer);



  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 3200);

}



function setText(id, value) {

  const element = $(id);

  if (element) element.textContent = value ?? "";

}



function setValue(id, value) {

  const element = $(id);

  if (element) element.value = value ?? "";

}



function setVisible(elementOrId, visible) {

  const element = typeof elementOrId === "string"

    ? $(elementOrId)

    : elementOrId;



  if (element) element.classList.toggle("hidden", !visible);

}



function getRoleLabel(role) {

  return role === "teacher" ? "Teacher" : "Student";

}



function initials(name) {

  return String(name || "S")

    .trim()

    .split(/\s+/)

    .slice(0, 2)

    .map((part) => part[0] || "")

    .join("")

    .toUpperCase() || "S";

}



function sameSection(user, section) {

  return user && user.section === section;

}



function taskIsCompleted(task) {

  if (currentUser?.role === "student") {

    return Array.isArray(task.completedBy)

      && task.completedBy.includes(currentUser.id);

  }



  return Boolean(task.completed);

}



function setError(id, message) {

  const element = $(id);

  if (element) element.textContent = message || "";

}



function makePasswordInputVisible(inputId, visible) {

  const input = $(inputId);

  if (input) input.type = visible ? "text" : "password";

}



function generateUsername(name) {

  const base = String(name)

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9]+/g, ".")

    .replace(/^\\.+|\\.+$/g, "");



  return base || `teacher${Date.now()}`;

}



/* =========================================================

   INITIAL DATA

\========================================================= */



function initializeStorage() {

  if (!localStorage.getItem(STORAGE.users)) {

    writeStorage(STORAGE.users, []);

  }



  if (!localStorage.getItem(STORAGE.tasks)) {

    writeStorage(STORAGE.tasks, []);

  }



  if (!localStorage.getItem(STORAGE.announcements)) {

    writeStorage(STORAGE.announcements, []);

  }

}



/* =========================================================

   AUTHENTICATION PANELS

\========================================================= */



let selectedRole = "student";



function selectRole(role) {

  selectedRole = role === "teacher" ? "teacher" : "student";



  const studentButton = $("studentRoleBtn");

  const teacherButton = $("teacherRoleBtn");

  const label = $("identifierLabel");

  const identifier = $("loginIdentifier");



  if (studentButton) {

    studentButton.classList.toggle("active", selectedRole === "student");

    studentButton.setAttribute(

      "aria-pressed",

      String(selectedRole === "student")

    );

  }



  if (teacherButton) {

    teacherButton.classList.toggle("active", selectedRole === "teacher");

    teacherButton.setAttribute(

      "aria-pressed",

      String(selectedRole === "teacher")

    );

  }



  if (label) {

    label.textContent = selectedRole === "student"

      ? "Student LRN"

      : "Teacher ID";

  }



  if (identifier) {

    identifier.placeholder = selectedRole === "student"

      ? "Enter your 12-digit LRN"

      : "Enter your teacher ID";



    identifier.value = "";

  }



  setError("loginError", "");

}



function showAuthPanel(panel) {

  setVisible("loginPanel", panel === "login");

  setVisible("teacherRegisterPanel", panel === "teacher");

  setVisible("studentRegisterPanel", panel === "student");



  setError("loginError", "");

  setError("teacherRegisterError", "");

  setError("studentRegisterError", "");



  const authPage = $("authPage");

  if (authPage) authPage.scrollTop = 0;

}



function showDashboard() {

  setVisible("authPage", false);

  setVisible("dashboardPage", true);



  updateUserInterface();

  navigateTo("overview");

  refreshAll();

}



function logout() {

  currentUser = null;

  sessionStorage.removeItem(STORAGE.currentUser);



  setVisible("dashboardPage", false);

  setVisible("authPage", true);



  showAuthPanel("login");

  showToast("You have logged out.");



  if ($("loginPassword")) $("loginPassword").value = "";

}



/* =========================================================

   LOGIN

\========================================================= */



function handleLogin(event) {

  event.preventDefault();



  const identifier = $("loginIdentifier")?.value.trim() || "";

  const password = $("loginPassword")?.value || "";



  setError("loginError", "");



  if (!identifier || !password) {

    setError("loginError", "Please enter your ID and password.");

    return;

  }



  if (selectedRole === "student" && !/^\d{12}$/.test(identifier)) {

    setError("loginError", "Student LRN must contain exactly 12 digits.");

    return;

  }



  const users = getUsers();



  const user = users.find((account) => {

    if (account.role !== selectedRole) return false;



    const savedIdentifier = selectedRole === "student"

      ? account.lrn

      : account.teacherId;



    return String(savedIdentifier || "").toLowerCase()

      === identifier.toLowerCase();

  });



  if (!user || user.password !== password) {

    setError("loginError", "Incorrect ID or password.");

    return;

  }



  currentUser = user;

  sessionStorage.setItem(STORAGE.currentUser, user.id);



  const remember = $("rememberLogin")?.checked;



  if (remember) {

    localStorage.setItem(STORAGE.rememberedId, identifier);

  } else {

    localStorage.removeItem(STORAGE.rememberedId);

  }



  if ($("loginPassword")) $("loginPassword").value = "";



  showDashboard();

  showToast(`Welcome, ${user.name}!`);

}



function restoreLogin() {

  const rememberedId = localStorage.getItem(STORAGE.rememberedId);



  if (rememberedId && $("loginIdentifier")) {

    $("loginIdentifier").value = rememberedId;



    if ($("rememberLogin")) {

      $("rememberLogin").checked = true;

    }

  }



  const sessionId = sessionStorage.getItem(STORAGE.currentUser);



  if (!sessionId) return;



  const user = getUsers().find((account) => account.id === sessionId);



  if (user) {

    currentUser = user;

    showDashboard();

  } else {

    sessionStorage.removeItem(STORAGE.currentUser);

  }

}

/* =========================================================

   REGISTRATION

\========================================================= */



function handleTeacherRegistration(event) {

  event.preventDefault();



  const name = $("teacherName")?.value.trim() || "";

  const teacherId = $("teacherId")?.value.trim() || "";

  const password = $("teacherPassword")?.value || "";

  const confirmPassword = $("teacherPasswordConfirm")?.value || "";

  const section = $("teacherSectionName")?.value || "";

  const roomPassword = $("teacherRoomPassword")?.value || "";

  const confirmRoomPassword = $("teacherRoomPasswordConfirm")?.value || "";



  setError("teacherRegisterError", "");



  if (!name || !teacherId || !section) {

    setError("teacherRegisterError", "Please complete all required fields.");

    return;

  }



  if (password.length < 8) {

    setError("teacherRegisterError", "Password must be at least 8 characters.");

    return;

  }



  if (password !== confirmPassword) {

    setError("teacherRegisterError", "Your passwords do not match.");

    return;

  }



  if (roomPassword.length < 4) {

    setError("teacherRegisterError", "Room password must be at least 4 characters.");

    return;

  }



  if (roomPassword !== confirmRoomPassword) {

    setError("teacherRegisterError", "Your room passwords do not match.");

    return;

  }



  const users = getUsers();



  const duplicate = users.some((user) =>

    user.role === "teacher"

    && String(user.teacherId || "").toLowerCase() === teacherId.toLowerCase()

  );



  if (duplicate) {

    setError("teacherRegisterError", "That Teacher ID is already registered.");

    return;

  }



  const teacher = {

    id: makeId(),

    role: "teacher",

    name,

    teacherId,

    username: teacherId,

    password,

    section,

    roomPassword,

    email: "",

    contact: "",

    profilePicture: "",

    createdAt: new Date().toISOString()

  };



  users.push(teacher);



  if (!saveUsers(users)) return;



  event.target.reset();

  selectRole("teacher");

  showAuthPanel("login");



  if ($("loginIdentifier")) $("loginIdentifier").value = teacherId;



  showToast("Teacher account created successfully.");

}



function ensureStudentClassroomFields() {

  const form = $("studentRegisterForm");

  const passwordLabel = form?.querySelector('label[for="studentPassword"]');

  if (!form || !passwordLabel) return;



  // Add classroom fields that are missing from the supplied HTML.

  if (!$("studentSectionName")) {

    const sectionLabel = document.createElement("label");

    sectionLabel.htmlFor = "studentSectionName";

    sectionLabel.textContent = "Class section";



    const sectionSelect = document.createElement("select");

    sectionSelect.id = "studentSectionName";

    sectionSelect.required = true;

    sectionSelect.innerHTML = `

      <option value="">Select your section</option>

      <option value="ICT Honesty">ICT Honesty</option>

      <option value="ICT Fidelity">ICT Fidelity</option>

    `;



    form.insertBefore(sectionLabel, passwordLabel);

    form.insertBefore(sectionSelect, passwordLabel);

  }



  if (!$("studentRoomPassword")) {

    const roomLabel = document.createElement("label");

    roomLabel.htmlFor = "studentRoomPassword";

    roomLabel.textContent = "Room join password";



    const roomInput = document.createElement("input");

    roomInput.id = "studentRoomPassword";

    roomInput.type = "password";

    roomInput.placeholder = "Enter the password provided by your teacher";

    roomInput.autocomplete = "off";

    roomInput.required = true;

    roomInput.minLength = 4;



    form.insertBefore(roomLabel, passwordLabel);

    form.insertBefore(roomInput, passwordLabel);

  }

}



function handleStudentRegistration(event) {

  event.preventDefault();



  const name = $("studentName")?.value.trim() || "";

  const lrn = $("studentLrn")?.value.trim() || "";

  const section = $("studentSectionName")?.value || "";

  const roomPassword = $("studentRoomPassword")?.value || "";

  const password = $("studentPassword")?.value || "";

  const confirmPassword = $("studentPasswordConfirm")?.value || "";



  setError("studentRegisterError", "");



  if (!name || !lrn || !section || !roomPassword || !password) {

    setError("studentRegisterError", "Please complete all required fields.");

    return;

  }



  if (!/^\d{12}$/.test(lrn)) {

    setError("studentRegisterError", "LRN must contain exactly 12 digits.");

    return;

  }



  if (password.length < 8) {

    setError("studentRegisterError", "Password must be at least 8 characters.");

    return;

  }



  if (password !== confirmPassword) {

    setError("studentRegisterError", "Your passwords do not match.");

    return;

  }



  const users = getUsers();



  if (users.some((user) => user.role === "student" && user.lrn === lrn)) {

    setError("studentRegisterError", "That LRN is already registered.");

    return;

  }



  const teacher = users.find((user) =>

    user.role === "teacher"

    && user.section === section

    && user.roomPassword === roomPassword

  );



  if (!teacher) {

    setError(

      "studentRegisterError",

      "Classroom details are incorrect. Check the section and room password with your teacher."

    );

    return;

  }



  const student = {

    id: makeId(),

    role: "student",

    name,

    lrn,

    password,

    section,

    teacherId: teacher.id,

    email: "",

    contact: "",

    profilePicture: "",

    createdAt: new Date().toISOString()

  };



  users.push(student);



  if (!saveUsers(users)) return;



  event.target.reset();

  selectRole("student");

  showAuthPanel("login");



  if ($("loginIdentifier")) $("loginIdentifier").value = lrn;



  showToast("Student account created successfully.");

}



/* =========================================================

   USER INTERFACE AND PROFILE

\========================================================= */



function updateUserInterface() {

  if (!currentUser) return;



  const user = currentUser;

  const roleLabel = getRoleLabel(user.role);

  const avatarText = initials(user.name);



  setText("sidebarUserName", user.name);

  setText("sidebarUserRole", roleLabel);

  setText("headerUserName", user.name);

  setText("headerUserRole", `${roleLabel} account`);

  setText("welcomeHeading", `Welcome back, ${user.name.split(" ")[0]}!`);



  setText("profileDisplayName", user.name);

  setText("profileDisplayRole", roleLabel);

  setText("profileDisplaySection", user.section || "No section");



  setText(

    "currentDate",

    new Date().toLocaleDateString("en-PH", {

      weekday: "long",

      year: "numeric",

      month: "long",

      day: "numeric"

    })

  );



  ["userAvatar", "headerAvatar"].forEach((id) => {

    setText(id, avatarText);

  });



  const picture = user.profilePicture || "";



  const avatarPairs = [

    ["userAvatarImage", "userAvatar"],

    ["headerAvatarImage", "headerAvatar"],

    ["profileAvatarPreview", "profileAvatarPlaceholder"]

  ];



  avatarPairs.forEach(([imageId, placeholderId]) => {

    const image = $(imageId);

    const placeholder = $(placeholderId);



    if (image) {

      if (picture) {

        image.src = picture;

        setVisible(image, true);

      } else {

        image.removeAttribute("src");

        setVisible(image, false);

      }

    }



    if (placeholder) {

      setVisible(placeholder, !picture);

    }

  });



  if ($("profileFullName")) $("profileFullName").value = user.name || "";

  if ($("profileEmail")) $("profileEmail").value = user.email || "";

  if ($("profileContact")) $("profileContact").value = user.contact || "";



  const isTeacher = user.role === "teacher";

  ensureSectionFeature();

  setVisible("teacherCapacityPanel", isTeacher);

  setVisible("teacherProgressPanel", isTeacher);

  setVisible("roomSetupForm", isTeacher && (!user.section || !user.roomPassword));



  setVisible("taskAssignmentGroup", isTeacher);

  setVisible("announcementTargetGroup", isTeacher);

  setVisible("addStudentForm", isTeacher);



  setVisible("addTaskBtn", isTeacher);

  setVisible("addAnnouncementBtn", isTeacher);



  $$(".nav-btn[data-view='students']").forEach((button) => {

    setVisible(button, isTeacher);

  });

  $$(".nav-btn[data-view='section']").forEach((button) => {

    setVisible(button, user.role === "student");

  });



  setText("tasksPageDescription", isTeacher

    ? "Create tasks and assign them to your classroom sections."

    : "View teacher-assigned tasks, personal tasks, and deadlines.");



  setText("totalTasksLabel", isTeacher ? "Created tasks" : "Assigned tasks");

  setText("roomSectionHeading", user.section || "Your classroom");

  setText(

    "roomSectionDescription",

    `Share the classroom section ${user.section || ""} with your students.`

  );



  if ($("roomSetupSection") && user.section) {

    $("roomSetupSection").value = user.section;

  }

}



function handleProfileSave(event) {

  event.preventDefault();



  if (!currentUser) return;



  const name = $("profileFullName")?.value.trim() || "";

  const email = $("profileEmail")?.value.trim() || "";

  const contact = $("profileContact")?.value.trim() || "";

  const file = $("profilePicture")?.files?.[0];



  setError("profileError", "");

  setText("profileSuccess", "");



  if (!name) {

    setError("profileError", "Please enter your full name.");

    return;

  }



  const saveProfile = (picture) => {

    const users = getUsers();

    const index = users.findIndex((user) => user.id === currentUser.id);



    if (index < 0) {

      setError("profileError", "Your account could not be found.");

      return;

    }



    users[index] = {

      ...users[index],

      name,

      email,

      contact,

      profilePicture: picture

    };



    if (!saveUsers(users)) return;



    currentUser = users[index];

    updateUserInterface();

    refreshAll();



    setText("profileSuccess", "Profile saved successfully!");

    showToast("Profile updated.");

  };



  if (file) {

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];



    if (!allowedTypes.includes(file.type)) {

      setError("profileError", "Please choose a JPG, PNG, or WebP image.");

      return;

    }



    if (file.size > 500 * 1024) {

      setError("profileError", "Please choose an image smaller than 500 KB.");

      return;

    }



    const reader = new FileReader();



    reader.onload = () => saveProfile(String(reader.result || ""));

    reader.onerror = () => setError("profileError", "Unable to read this image.");



    reader.readAsDataURL(file);

  } else {

    saveProfile(currentUser.profilePicture || "");

  }

}



function removeProfilePicture() {

  if (!currentUser) return;



  const users = getUsers();

  const index = users.findIndex((user) => user.id === currentUser.id);



  if (index < 0) return;



  users[index].profilePicture = "";



  if (!saveUsers(users)) return;



  currentUser = users[index];



  if ($("profilePicture")) $("profilePicture").value = "";



  updateUserInterface();

  showToast("Profile picture removed.");

}

/* =========================================================

   NAVIGATION

\========================================================= */



function navigateTo(view) {

  const allowedViews = ["overview", "tasks", "announcements", "students", "section", "profile"];



  if (!allowedViews.includes(view)) view = "overview";



  if (view === "students" && currentUser?.role !== "teacher") {

    view = "overview";

  }

  if (view === "section" && currentUser?.role !== "student") {

    view = "overview";

  }



  currentView = view;



  const viewIds = {

    overview: "overviewView",

    tasks: "tasksView",

    announcements: "announcementsView",

    students: "studentsView",

    section: "sectionView",

    profile: "profileView"

  };



  Object.entries(viewIds).forEach(([name, id]) => {

    setVisible(id, name === view);

  });



  $$(".nav-btn").forEach((button) => {

    button.classList.toggle("active", button.dataset.view === view);

  });



  const titles = {

    overview: "Overview",

    tasks: "My Tasks",

    announcements: "Announcements",

    students: "Students",

    section: "Section",

    profile: "My Profile"

  };



  setText("headerPageTitle", titles[view]);

}



function navigateFromButton(button) {

  const view = button.dataset.view || button.dataset.go;

  if (view) navigateTo(view);

}



/* =========================================================

   TASK VISIBILITY

\========================================================= */



function visibleTasks() {

  const tasks = getTasks();



  if (!currentUser) return [];



  if (currentUser.role === "teacher") {

    return tasks.filter((task) => task.teacherId === currentUser.id);

  }



  return tasks.filter((task) => {

    if (task.teacherId === currentUser.teacherId) {

      if (task.ownerId) return task.ownerId === currentUser.id;



      return task.targetSection === "both"

        || task.targetSection === currentUser.section;

    }



    return task.ownerId === currentUser.id;

  });

}



function isTaskCompletedForUser(task, userId) {

  return Array.isArray(task.completedBy)

    && task.completedBy.includes(userId);

}



function getTaskStatus(task) {

  if (currentUser?.role === "student") {

    return isTaskCompletedForUser(task, currentUser.id)

      ? "completed"

      : "pending";

  }



  return task.completed ? "completed" : "pending";

}



/* =========================================================

   TASK CREATION AND EDITING

\========================================================= */



function openTaskForm(task = null) {

  if (!currentUser) return;



  if (currentUser.role !== "teacher") {

    showToast("Only teachers can create classroom tasks.", "error");

    return;

  }



  editingTaskId = task?.id || null;



  if ($("taskForm")) $("taskForm").reset();



  setText("taskFormHeading", task ? "Edit task" : "Create a new task");

  setText("taskSubmitBtn", task ? "Save Changes" : "Send Task");



  if (task) {

    setValue("taskTitle", task.title);

    setValue("taskType", task.type);

    setValue("taskSubject", task.subject);

    setValue("taskDescription", task.description);

    setValue("taskDueDate", task.dueDate);

    setValue("taskPriority", task.priority || "Normal");

    setValue("taskTargetSection", task.targetSection || "both");

  } else {

    setValue("taskTargetSection", "both");

    setValue("taskDueDate", todayString());

  }



  setVisible("taskForm", true);

  $("taskForm")?.scrollIntoView({ behavior: "smooth", block: "start" });

}



function handleTaskSubmit(event) {

  event.preventDefault();



  if (!currentUser || currentUser.role !== "teacher") {

    showToast("Only teachers can send classroom tasks.", "error");

    return;

  }



  const title = $("taskTitle")?.value.trim() || "";

  const type = $("taskType")?.value || "Assignment";

  const subject = $("taskSubject")?.value.trim() || "";

  const description = $("taskDescription")?.value.trim() || "";

  const dueDate = $("taskDueDate")?.value || "";

  const priority = $("taskPriority")?.value || "Normal";

  const targetSection = $("taskTargetSection")?.value || "both";



  if (!title || !subject || !description || !dueDate) {

    showToast("Please complete all task fields.", "error");

    return;

  }



  if (!["both", ...SECTIONS].includes(targetSection)) {

    showToast("Please choose a valid target section.", "error");

    return;

  }



  const tasks = getTasks();



  if (editingTaskId) {

    const index = tasks.findIndex((task) =>

      task.id === editingTaskId && task.teacherId === currentUser.id

    );



    if (index < 0) {

      showToast("Task not found.", "error");

      return;

    }



    tasks[index] = {

      ...tasks[index],

      title,

      type,

      subject,

      description,

      dueDate,

      priority,

      targetSection,

      updatedAt: new Date().toISOString()

    };

  } else {

    tasks.unshift({

      id: makeId(),

      teacherId: currentUser.id,

      ownerId: null,

      title,

      type,

      subject,

      description,

      dueDate,

      priority,

      targetSection,

      completedBy: [],

      comments: [],

      createdAt: new Date().toISOString()

    });

  }



  if (!saveTasks(tasks)) return;



  $("taskForm")?.reset();

  setVisible("taskForm", false);

  editingTaskId = null;



  refreshAll();

  showToast("Task saved successfully.");

}



function cancelTaskForm() {

  editingTaskId = null;



  if ($("taskForm")) $("taskForm").reset();



  setVisible("taskForm", false);

  setText("taskFormHeading", "Create a new task");

  setText("taskSubmitBtn", "Send Task");

}



function toggleTaskCompletion(taskId) {

  if (!currentUser) return;



  const tasks = getTasks();

  const task = tasks.find((item) => item.id === taskId);



  if (!task) return;



  if (currentUser.role === "teacher") {

    if (task.teacherId !== currentUser.id) return;



    task.completed = !task.completed;

  } else {

    if (task.ownerId && task.ownerId !== currentUser.id) return;



    if (!Array.isArray(task.completedBy)) task.completedBy = [];



    const index = task.completedBy.indexOf(currentUser.id);



    if (index >= 0) {

      task.completedBy.splice(index, 1);

    } else {

      task.completedBy.push(currentUser.id);

    }

  }



  if (!saveTasks(tasks)) return;



  refreshAll();

  showToast("Task status updated.");

}



function deleteTask(taskId) {

  if (currentUser?.role !== "teacher") return;



  const tasks = getTasks();

  const task = tasks.find((item) => item.id === taskId);



  if (!task || task.teacherId !== currentUser.id) return;



  if (!confirm(`Delete "${task.title}"?`)) return;



  saveTasks(tasks.filter((item) => item.id !== taskId));

  refreshAll();

  showToast("Task deleted.");

}



function addTaskComment(taskId, sourceInput = null) {

  if (!currentUser) return;



  const input = sourceInput || document.querySelector(

    `.task-card [data-task-comment-input][data-task-id="${CSS.escape(taskId)}"]`

  );



  const message = input?.value.trim() || "";



  if (!message) {

    showToast("Please write a comment first.", "error");

    return;

  }



  const tasks = getTasks();

  const task = tasks.find((item) => item.id === taskId);



  if (!task) return;



  if (!Array.isArray(task.comments)) task.comments = [];



  task.comments.push({

    id: makeId(),

    userId: currentUser.id,

    userName: currentUser.name,

    role: currentUser.role,

    message,

    createdAt: new Date().toISOString()

  });



  if (!saveTasks(tasks)) return;



  refreshAll();

  showToast("Comment added.");

}



/* =========================================================

   TASK RENDERING

\========================================================= */



function renderTaskSubmissionMonitor(task) {
  if (currentUser?.role !== "teacher" || task.teacherId !== currentUser.id) return "";

  const users = getUsers();
  const sections = task.targetSection === "both"
    ? ["ICT Honesty", "ICT Fidelity"]
    : [task.targetSection || currentUser.section];

  const students = users.filter((user) =>
    user.role === "student"
    && user.teacherId === currentUser.id
    && sections.includes(user.section)
  ).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

  const submittedIds = Array.isArray(task.completedBy) ? task.completedBy : [];
  const submitted = students.filter((student) => submittedIds.includes(student.id));
  const notSubmitted = students.filter((student) => !submittedIds.includes(student.id));
  const safeId = escapeHTML(task.id);

  const renderStudentRow = (student, isSubmitted) => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border-color, #e5e7eb);">
      <span style="font-weight:500;">${escapeHTML(student.name || "Unnamed student")}</span>
      <span style="font-size:0.85rem;font-weight:700;color:${isSubmitted ? "#15803d" : "#b91c1c"};white-space:nowrap;">
        ${isSubmitted ? "✓ Submitted" : "• Not submitted"}
      </span>
    </div>`;

  return `
    <section class="task-submission-monitor" style="margin-top:14px;padding:14px;border:1px solid var(--border-color, #e5e7eb);border-radius:12px;background:var(--card-inner-bg, rgba(127,127,127,0.05));">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
        <strong>📋 Submission Monitor</strong>
        <span style="font-size:0.9rem;">${submitted.length} of ${students.length} submitted</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <span style="padding:5px 9px;border-radius:999px;background:#dcfce7;color:#166534;font-size:0.85rem;font-weight:700;">Submitted: ${submitted.length}</span>
        <span style="padding:5px 9px;border-radius:999px;background:#fee2e2;color:#991b1b;font-size:0.85rem;font-weight:700;">Not submitted: ${notSubmitted.length}</span>
      </div>
      <details>
        <summary style="cursor:pointer;font-weight:600;">View student submission status</summary>
        <div style="margin-top:8px;">
          ${students.length
            ? students.map((student) => renderStudentRow(student, submittedIds.includes(student.id))).join("")
            : '<p class="form-help">No students are currently linked to your teacher account in the selected section(s).</p>'}
        </div>
      </details>
    </section>
  `;
}

function renderTaskCard(task, context = "list") {
  const completed = getTaskStatus(task) === "completed";
  const isTeacher = currentUser?.role === "teacher";
  const comments = Array.isArray(task.comments) ? task.comments : [];
  const safeId = escapeHTML(task.id);

  const target = task.targetSection === "both"
    ? "Both sections"
    : (task.targetSection || "Personal task");

  const actions = isTeacher
    ? `
      <button type="button" class="small-btn"
        data-action="edit-task" data-id="${safeId}">Edit</button>
      <button type="button" class="small-btn danger-btn"
        data-action="delete-task" data-id="${safeId}">Delete</button>
    `
    : `
      <button type="button" class="small-btn"
        data-action="toggle-task" data-id="${safeId}">
        ${completed ? "Mark Pending" : "Mark Completed"}
      </button>
    `;

  const commentHTML = comments.map((comment) => {
    const isCommentAuthor = comment.userId === currentUser?.id;
    const canModerate = isTeacher && task.teacherId === currentUser.id;
    const controls = isCommentAuthor
      ? `
        <div class="comment-actions">
          <button type="button" class="small-btn"
            data-action="edit-task-comment" data-id="${safeId}"
            data-comment-id="${escapeHTML(comment.id || "")}">Edit</button>
          <button type="button" class="small-btn danger-btn"
            data-action="delete-task-comment" data-id="${safeId}"
            data-comment-id="${escapeHTML(comment.id || "")}">Delete</button>
        </div>
      `
      : canModerate
        ? `
          <div class="comment-actions">
            <button type="button" class="small-btn danger-btn"
              data-action="delete-task-comment" data-id="${safeId}"
              data-comment-id="${escapeHTML(comment.id || "")}">Delete</button>
          </div>
        `
        : "";

    return `
      <div class="comment-item">
        <strong><button type="button" class="profile-open-button profile-open-name"
          data-action="view-profile" data-id="${escapeHTML(comment.userId || "")}">${escapeHTML(comment.userName || "User")}</button></strong>
        <span class="comment-role">${escapeHTML(getRoleLabel(comment.role))}</span>
        <p>${escapeHTML(comment.message)}</p>
        ${controls}
      </div>
    `;
  }).join("");

  return `
    <article class="task-card ${completed ? "task-completed" : ""}">
      <div class="task-card-top">
        <span class="task-type-badge">${escapeHTML(task.type || "Task")}</span>
        <span class="task-status ${completed ? "completed" : "pending"}">
          ${completed ? "Completed" : "Pending"}
        </span>
      </div>

      <div class="task-card-content">
        <h3>${escapeHTML(task.title)}</h3>
        <p class="task-subject">${escapeHTML(task.subject)}</p>
        <p class="task-description">${escapeHTML(task.description)}</p>
      </div>

      <div class="task-meta">
        <span>📅 Due: ${escapeHTML(formatDate(task.dueDate))}</span>
        <span>⚑ ${escapeHTML(task.priority || "Normal")} priority</span>
        ${isTeacher ? `<span>🎓 ${escapeHTML(target)}</span>` : ""}
      </div>

      <div class="task-actions">${actions}</div>

      ${isTeacher ? renderTaskSubmissionMonitor(task) : ""}

      <div class="task-comment-toggle-row">
        <button type="button" class="small-btn comment-toggle-btn"
          data-action="toggle-task-comments" data-id="${safeId}"
          data-count="${comments.length}" aria-expanded="false">
          View Comments (${comments.length})
        </button>
      </div>

      <div class="task-comments hidden">
        <h4>Comments (${comments.length})</h4>
        <div class="task-comments-list">
          ${commentHTML || '<p class="form-help">No comments yet.</p>'}
        </div>

        <div class="comment-input-row">
          <input type="text"
            id="task-comment-${escapeHTML(context)}-${safeId}"
            data-task-comment-input data-task-id="${safeId}"
            placeholder="Write a comment..." maxlength="500">
          <button type="button" class="small-btn"
            data-action="task-comment" data-id="${safeId}">Send</button>
        </div>
      </div>
    </article>
  `;
}

function renderTasks() {

  const tasks = visibleTasks();



  const search = ($("taskSearch")?.value || "").trim().toLowerCase();

  const statusFilter = $("taskFilter")?.value || "all";

  const typeFilter = $("taskTypeFilter")?.value || "all";



  const filtered = tasks.filter((task) => {

    const matchesSearch = !search

      || `${task.title} ${task.subject} ${task.description}`

        .toLowerCase()

        .includes(search);



    const status = getTaskStatus(task);



    const matchesStatus = statusFilter === "all"

      || status === statusFilter;



    const matchesType = typeFilter === "all"

      || task.type === typeFilter;



    return matchesSearch && matchesStatus && matchesType;

  });



  const allTasks = $("allTasks");



  if (allTasks) {

    allTasks.innerHTML = filtered.length

      ? filtered.map((task) => renderTaskCard(task, "all")).join("")

      : `

        <div class="empty-state">

          <strong>No tasks found</strong>

          <p>Try changing your search or filter.</p>

        </div>

      `;

  }



  const recentTasks = $("recentTasks");



  if (recentTasks) {

    const recent = [...tasks]

      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

      .slice(0, 3);



    recentTasks.innerHTML = recent.length

      ? recent.map((task) => renderTaskCard(task, "recent")).join("")

      : `

        <div class="empty-state">

          <strong>No tasks yet</strong>

          <p>Teacher-assigned tasks will appear here.</p>

        </div>

      `;

  }



  const completedCount = tasks.filter((task) =>

    getTaskStatus(task) === "completed"

  ).length;



  setText("totalTasks", tasks.length);

  setText("pendingTasks", tasks.length - completedCount);

  setText("completedTasks", completedCount);

  setText("taskNavCount", tasks.filter((task) =>

    getTaskStatus(task) === "pending"

  ).length);

}



/* =========================================================

   ANNOUNCEMENTS

\========================================================= */



function visibleAnnouncements() {

  const announcements = getAnnouncements();



  if (!currentUser) return [];



  if (currentUser.role === "teacher") {

    return announcements.filter((item) =>

      item.teacherId === currentUser.id

    );

  }



  return announcements.filter((item) => {

    if (item.teacherId !== currentUser.teacherId) return false;



    return item.targetSection === "both"

      || item.targetSection === currentUser.section;

  });

}



function openAnnouncementForm() {

  if (currentUser?.role !== "teacher") return;



  if ($("announcementForm")) $("announcementForm").reset();



  setValue("announcementTargetSection", "both");

  setVisible("announcementForm", true);



  $("announcementForm")?.scrollIntoView({

    behavior: "smooth",

    block: "start"

  });

}



function handleAnnouncementSubmit(event) {

  event.preventDefault();



  if (currentUser?.role !== "teacher") return;



  const title = $("announcementTitle")?.value.trim() || "";

  const message = $("announcementMessage")?.value.trim() || "";

  const targetSection = $("announcementTargetSection")?.value || "both";



  if (!title || !message) {

    showToast("Please complete the announcement.", "error");

    return;

  }



  if (!["both", ...SECTIONS].includes(targetSection)) {

    showToast("Please choose a valid section.", "error");

    return;

  }



  const announcements = getAnnouncements();



  announcements.unshift({

    id: makeId(),

    teacherId: currentUser.id,

    teacherName: currentUser.name,

    title,

    message,

    targetSection,

    comments: [],

    createdAt: new Date().toISOString()

  });



  if (!saveAnnouncements(announcements)) return;



  $("announcementForm")?.reset();

  setVisible("announcementForm", false);



  refreshAll();

  showToast("Announcement published.");

}



function cancelAnnouncementForm() {

  if ($("announcementForm")) $("announcementForm").reset();

  setVisible("announcementForm", false);

}



function addAnnouncementComment(announcementId, sourceInput = null) {

  if (!currentUser) return;



  const input = sourceInput || document.querySelector(

    `.announcement-card [data-announcement-comment-input][data-announcement-id="${CSS.escape(announcementId)}"]`

  );



  const message = input?.value.trim() || "";



  if (!message) {

    showToast("Please write a comment first.", "error");

    return;

  }



  const announcements = getAnnouncements();

  const item = announcements.find((announcement) =>

    announcement.id === announcementId

  );



  if (!item) return;



  if (!Array.isArray(item.comments)) item.comments = [];



  item.comments.push({

    id: makeId(),

    userId: currentUser.id,

    userName: currentUser.name,

    role: currentUser.role,

    message,

    createdAt: new Date().toISOString()

  });



  if (!saveAnnouncements(announcements)) return;



  renderAnnouncements();

  showToast("Comment added.");

}



function toggleComments(button, selector) {
  const card = button.closest(".task-card, .announcement-card");
  const commentsBox = card?.querySelector(selector);
  if (!commentsBox) return;

  const willShow = commentsBox.classList.contains("hidden");
  commentsBox.classList.toggle("hidden", !willShow);
  button.setAttribute("aria-expanded", String(willShow));

  const count = button.dataset.count || "0";
  const label = selector === ".task-comments" ? "Comments" : "Comments";
  button.textContent = `${willShow ? "Hide" : "View"} ${label} (${count})`;
}

function editOrDeleteComment(type, parentId, commentId, action) {
  if (!currentUser || !commentId) {
    showToast("This comment cannot be edited because it has no comment ID.", "error");
    return;
  }

  const isTask = type === "task";
  const items = isTask ? getTasks() : getAnnouncements();
  const parent = items.find((item) => item.id === parentId);
  if (!parent) return;

  const comments = Array.isArray(parent.comments) ? parent.comments : [];
  const comment = comments.find((item) => item.id === commentId);
  if (!comment) {
    showToast("Comment not found. Refresh the page and try again.", "error");
    return;
  }

  const isAuthor = comment.userId === currentUser.id;
  const isOwnerTeacher = currentUser.role === "teacher" && (
    isTask ? parent.teacherId === currentUser.id : parent.teacherId === currentUser.id
  );

  if (!isAuthor && !(action === "delete" && isOwnerTeacher)) {
    showToast("You can only edit or delete your own comments.", "error");
    return;
  }

  if (action === "edit") {
    if (!isAuthor) return;
    const updatedMessage = prompt("Edit your comment:", comment.message || "");
    if (updatedMessage === null) return;

    const trimmedMessage = updatedMessage.trim();
    if (!trimmedMessage) {
      showToast("A comment cannot be empty.", "error");
      return;
    }
    if (trimmedMessage.length > 500) {
      showToast("Comments must be 500 characters or fewer.", "error");
      return;
    }

    comment.message = trimmedMessage;
    comment.editedAt = new Date().toISOString();
  } else if (action === "delete") {
    if (!confirm("Delete this comment?")) return;
    parent.comments = comments.filter((item) => item.id !== commentId);
  } else {
    return;
  }

  const saved = isTask ? saveTasks(items) : saveAnnouncements(items);
  if (!saved) return;

  refreshAll();
  showToast(action === "edit" ? "Comment updated." : "Comment deleted.");
}


function deleteAnnouncement(announcementId) {

  if (currentUser?.role !== "teacher") return;



  const announcements = getAnnouncements();

  const item = announcements.find((announcement) =>

    announcement.id === announcementId

    && announcement.teacherId === currentUser.id

  );



  if (!item) return;



  if (!confirm(`Delete announcement "${item.title}"?`)) return;



  saveAnnouncements(announcements.filter((announcement) =>

    announcement.id !== announcementId

  ));



  refreshAll();

  showToast("Announcement deleted.");

}



function renderAnnouncementCard(item) {
  const comments = Array.isArray(item.comments) ? item.comments : [];
  const isTeacher = currentUser?.role === "teacher";
  const safeId = escapeHTML(item.id);

  const commentHTML = comments.map((comment) => {
    const isCommentAuthor = comment.userId === currentUser?.id;
    const canModerate = isTeacher && item.teacherId === currentUser.id;
    const controls = isCommentAuthor
      ? `
        <div class="comment-actions">
          <button type="button" class="small-btn"
            data-action="edit-announcement-comment" data-id="${safeId}"
            data-comment-id="${escapeHTML(comment.id || "")}">Edit</button>
          <button type="button" class="small-btn danger-btn"
            data-action="delete-announcement-comment" data-id="${safeId}"
            data-comment-id="${escapeHTML(comment.id || "")}">Delete</button>
        </div>
      `
      : canModerate
        ? `
          <div class="comment-actions">
            <button type="button" class="small-btn danger-btn"
              data-action="delete-announcement-comment" data-id="${safeId}"
              data-comment-id="${escapeHTML(comment.id || "")}">Delete</button>
          </div>
        `
        : "";

    return `
      <div class="comment-item">
        <strong><button type="button" class="profile-open-button profile-open-name"
          data-action="view-profile" data-id="${escapeHTML(comment.userId || "")}">${escapeHTML(comment.userName || "User")}</button></strong>
        <span class="comment-role">${escapeHTML(getRoleLabel(comment.role))}</span>
        <p>${escapeHTML(comment.message)}</p>
        ${controls}
      </div>
    `;
  }).join("");

  return `
    <article class="announcement-card">
      <div class="announcement-card-top">
        <span class="announcement-tag">📢 Announcement</span>
        <small>${escapeHTML(new Date(item.createdAt).toLocaleDateString("en-PH"))}</small>
      </div>

      <h3>${escapeHTML(item.title)}</h3>
      <p class="announcement-author">Posted by <button type="button" class="profile-open-button profile-open-name"
        data-action="view-profile" data-id="${escapeHTML(item.teacherId || "")}">${escapeHTML(item.teacherName || "Teacher")}</button></p>
      <p class="announcement-message">${escapeHTML(item.message)}</p>

      ${isTeacher ? `
        <p class="form-help">
          Sent to: ${escapeHTML(item.targetSection === "both" ? "Both sections" : item.targetSection)}
        </p>
        <button type="button" class="small-btn danger-btn"
          data-action="delete-announcement" data-id="${safeId}">
          Delete Announcement
        </button>
      ` : ""}

      <div class="announcement-comment-toggle-row">
        <button type="button" class="small-btn comment-toggle-btn"
          data-action="toggle-announcement-comments" data-id="${safeId}"
          data-count="${comments.length}" aria-expanded="false">
          View Comments (${comments.length})
        </button>
      </div>

      <div class="announcement-comments hidden">
        <h4>Comments (${comments.length})</h4>
        <div class="announcement-comment-list">
          ${commentHTML || '<p class="form-help">No comments yet.</p>'}
        </div>

        <div class="announcement-comment-form">
          <input type="text"
            id="announcement-comment-${safeId}"
            data-announcement-comment-input data-announcement-id="${safeId}"
            placeholder="Write a comment..." maxlength="500">
          <button type="button" class="small-btn"
            data-action="announcement-comment" data-id="${safeId}">Send</button>
        </div>
      </div>
    </article>
  `;
}

function renderAnnouncements() {

  const announcements = visibleAnnouncements();



  const renderList = (id, items) => {

    const container = $(id);

    if (!container) return;



    container.innerHTML = items.length

      ? items.map(renderAnnouncementCard).join("")

      : `

        <div class="empty-state">

          <strong>No announcements yet</strong>

          <p>Check back for classroom updates.</p>

        </div>

      `;

  };



  renderList("allAnnouncements", announcements);

  renderList("recentAnnouncements", announcements.slice(0, 2));



  setText("announcementNavCount", announcements.length);

}



/* =========================================================

   STUDENTS DIRECTORY

\========================================================= */



function ensureProfileViewer() {
  if ($("profileViewerModal")) return;
  const style = document.createElement("style");
  style.id = "profileViewerStyles";
  style.textContent = `
    .profile-viewer-backdrop { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(15,23,42,.72); }
    .profile-viewer-backdrop.hidden { display:none !important; }
    .profile-viewer-card { width:min(100%,430px); max-height:90vh; overflow-y:auto; position:relative; padding:28px; border-radius:18px; background:var(--card-bg,#fff); color:var(--text-color,#1f2937); box-shadow:0 20px 60px rgba(0,0,0,.28); text-align:center; }
    .profile-viewer-close { position:absolute; top:10px; right:12px; border:0; background:transparent; color:inherit; font-size:28px; cursor:pointer; line-height:1; }
    .profile-viewer-avatar { width:112px; height:112px; margin:8px auto 16px; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#dbeafe; color:#1d4ed8; font-size:32px; font-weight:700; }
    .profile-viewer-avatar img,.student-avatar img { width:100%; height:100%; object-fit:cover; }
    .profile-viewer-role { margin:6px 0 18px; opacity:.75; }
    .profile-viewer-details { text-align:left; display:grid; gap:10px; margin-top:18px; }
    .profile-viewer-detail { padding:11px 12px; border-radius:10px; background:rgba(148,163,184,.13); overflow-wrap:anywhere; }
    .profile-viewer-detail strong { display:block; margin-bottom:3px; font-size:12px; opacity:.7; }
    .profile-open-button { border:0; padding:0; margin:0; background:none; color:inherit; font:inherit; text-align:inherit; cursor:pointer; }
    .profile-open-button:hover { text-decoration:underline; }
    .student-avatar.profile-open-button { display:flex; align-items:center; justify-content:center; border-radius:50%; overflow:hidden; }
    .profile-open-name { font-weight:700; }
  `;
  document.head.appendChild(style);
  const modal = document.createElement("div");
  modal.id = "profileViewerModal";
  modal.className = "profile-viewer-backdrop hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "profileViewerName");
  modal.innerHTML = `
    <section class="profile-viewer-card">
      <button type="button" class="profile-viewer-close" data-action="close-profile" aria-label="Close profile">&times;</button>
      <div class="profile-viewer-avatar" id="profileViewerAvatar"></div>
      <h2 id="profileViewerName"></h2><p class="profile-viewer-role" id="profileViewerRole"></p>
      <div class="profile-viewer-details" id="profileViewerDetails"></div>
    </section>`;
  modal.addEventListener("click", (event) => { if (event.target === modal) closeProfileViewer(); });
  document.body.appendChild(modal);
}

function openProfileViewer(userId) {
  const user = getUsers().find((item) => item.id === userId);
  if (!user) { showToast("That user profile could not be found.", "error"); return; }
  ensureProfileViewer();
  const modal = $("profileViewerModal"), avatar = $("profileViewerAvatar");
  const name = $("profileViewerName"), role = $("profileViewerRole"), details = $("profileViewerDetails");
  if (!modal || !avatar || !name || !role || !details) return;
  avatar.innerHTML = user.profilePicture
    ? `<img src="${escapeHTML(user.profilePicture)}" alt="${escapeHTML(user.name)}'s profile picture">`
    : escapeHTML(initials(user.name));
  name.textContent = user.name || "User";
  role.textContent = getRoleLabel(user.role);
  const detailRows = [
    ["Section", user.section || "Not provided"],
    ["Email", user.email || "Not provided"],
    ["Contact", user.contact || "Not provided"]
  ];
  if (user.role === "student") {
    const teacher = getUsers().find((item) => item.id === user.teacherId);
    detailRows.push(["Teacher", teacher?.name || "Not available"]);
  }
  details.innerHTML = detailRows.map(([label, value]) =>
    `<div class="profile-viewer-detail"><strong>${escapeHTML(label)}</strong>${escapeHTML(value)}</div>`
  ).join("");
  modal.classList.remove("hidden");
  modal.querySelector('[data-action="close-profile"]')?.focus();
}

function closeProfileViewer() {
  $("profileViewerModal")?.classList.add("hidden");
}

function ensureSectionFeature() {
  // Create a Section item in the main menu without requiring an HTML edit.
  const existingButton = document.querySelector(".nav-btn[data-view='section']");
  const profileButton = document.querySelector(".nav-btn[data-view='profile']");

  if (!existingButton && profileButton) {
    const sectionButton = profileButton.cloneNode(true);
    sectionButton.dataset.view = "section";
    sectionButton.classList.remove("active");
    sectionButton.setAttribute("aria-label", "Section");
    sectionButton.setAttribute("title", "Section");

    const spans = sectionButton.querySelectorAll("span");
    if (spans.length) {
      spans[spans.length - 1].textContent = "Section";
    } else {
      sectionButton.textContent = "Section";
    }

    sectionButton.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("section");
      renderSectionView();
    });
    profileButton.parentNode.insertBefore(sectionButton, profileButton);
  }

  const currentSectionButton = document.querySelector(".nav-btn[data-view='section']");
  if (currentSectionButton) {
    setVisible(currentSectionButton, currentUser?.role === "student");
    if (!currentSectionButton.dataset.sectionFeatureBound) {
      currentSectionButton.dataset.sectionFeatureBound = "true";
      currentSectionButton.addEventListener("click", (event) => {
        event.preventDefault();
        navigateTo("section");
        renderSectionView();
      });
    }
  }

  // Place the new page beside the other dashboard pages.
  if (!$("sectionView")) {
    const profileView = $("profileView");
    if (profileView?.parentNode) {
      const sectionView = document.createElement("section");
      sectionView.id = "sectionView";
      sectionView.className = profileView.className || "dashboard-view";
      sectionView.classList.add("hidden");
      profileView.parentNode.insertBefore(sectionView, profileView);
    }
  }
}

function renderSectionView() {
  if (currentUser?.role !== "student") return;
  ensureSectionFeature();

  const container = $("sectionView");
  if (!container) return;

  const users = getUsers();
  const sections = ["ICT Honesty", "ICT Fidelity"];
  const currentSection = currentUser.section || "No section assigned";

  const avatarMarkup = (user, extraClass = "") => `
    <button type="button" class="section-person-avatar profile-open-button ${extraClass}"
      data-action="view-profile" data-id="${escapeHTML(user.id)}"
      aria-label="View ${escapeHTML(user.name || "user")}'s profile">
      ${user.profilePicture
        ? `<img src="${escapeHTML(user.profilePicture)}" alt="">`
        : escapeHTML(initials(user.name))}
    </button>`;

  const personCard = (user, kind) => `
    <article class="section-person-card">
      ${avatarMarkup(user)}
      <div class="section-person-info">
        <h4><button type="button" class="section-person-name profile-open-button"
          data-action="view-profile" data-id="${escapeHTML(user.id)}">${escapeHTML(user.name || "Unnamed user")}</button></h4>
        <p>${kind === "teacher" ? "Teacher" : "Student"}</p>
      </div>
      <button type="button" class="section-view-profile" data-action="view-profile"
        data-id="${escapeHTML(user.id)}">View profile</button>
    </article>`;

  const sectionMarkup = sections.map((sectionName) => {
    const students = users.filter((user) =>
      user.role === "student" && user.section === sectionName
    ).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    // Prefer teachers explicitly assigned to this section; also include teachers
    // referenced by students in the section in case a teacher's section field is blank.
    const teacherIds = new Set(students.map((student) => student.teacherId).filter(Boolean));
    const teachers = users.filter((user) => user.role === "teacher" &&
      (user.section === sectionName || teacherIds.has(user.id))
    ).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    const teacherMarkup = teachers.length
      ? teachers.map((teacher) => personCard(teacher, "teacher")).join("")
      : `<p class="section-empty-note">No teacher account is currently linked to this section.</p>`;

    const studentsMarkup = students.length
      ? students.map((student) => personCard(student, "student")).join("")
      : `<p class="section-empty-note">No student accounts found in ${escapeHTML(sectionName)} on this browser yet.</p>`;

    return `
      <section class="section-group">
        <div class="section-group-heading">
          <div><h3>${escapeHTML(sectionName)}</h3><p>${students.length} student${students.length === 1 ? "" : "s"}</p></div>
          ${currentUser.section === sectionName ? `<span class="section-current-badge">Your section</span>` : ""}
        </div>
        <h4 class="section-subheading">Teacher${teachers.length === 1 ? "" : "s"}</h4>
        <div class="section-people-list">${teacherMarkup}</div>
        <h4 class="section-subheading">Students</h4>
        <div class="section-people-list">${studentsMarkup}</div>
      </section>`;
  }).join("");

  container.innerHTML = `
    <style>
      #sectionView .section-hero { padding:24px; margin-bottom:22px; border-radius:16px; background:linear-gradient(135deg,#1d4ed8,#4f46e5); color:#fff; }
      #sectionView .section-hero h2 { margin:0 0 8px; }
      #sectionView .section-hero p { margin:0; opacity:.92; }
      #sectionView .section-groups { display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:18px; }
      #sectionView .section-group { min-width:0; padding:18px; border:1px solid rgba(148,163,184,.35); border-radius:16px; background:var(--card-bg,#fff); color:var(--text-color,#1f2937); }
      #sectionView .section-group-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:18px; }
      #sectionView .section-group-heading h3 { margin:0 0 4px; }
      #sectionView .section-group-heading p, #sectionView .section-empty-note { margin:0; font-size:13px; opacity:.72; }
      #sectionView .section-current-badge { flex:0 0 auto; border-radius:999px; padding:6px 9px; background:#dbeafe; color:#1d4ed8; font-size:11px; font-weight:700; }
      #sectionView .section-subheading { margin:16px 0 10px; font-size:14px; }
      #sectionView .section-people-list { display:grid; gap:10px; }
      #sectionView .section-person-card { display:flex; align-items:center; gap:10px; min-width:0; padding:11px; border:1px solid rgba(148,163,184,.25); border-radius:12px; }
      #sectionView .section-person-avatar { width:44px; height:44px; flex:0 0 44px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:0; border-radius:50%; background:#dbeafe; color:#1d4ed8; font-weight:700; cursor:pointer; }
      #sectionView .section-person-avatar img { width:100%; height:100%; object-fit:cover; }
      #sectionView .section-person-info { min-width:0; flex:1; }
      #sectionView .section-person-info h4 { margin:0 0 3px; font-size:13px; overflow-wrap:anywhere; }
      #sectionView .section-person-info p { margin:0; font-size:12px; opacity:.7; }
      #sectionView .section-person-name { padding:0; border:0; background:transparent; color:inherit; text-align:left; font:inherit; font-weight:700; cursor:pointer; }
      #sectionView .section-view-profile { border:0; border-radius:8px; padding:7px 9px; cursor:pointer; background:#2563eb; color:#fff; font-size:11px; white-space:nowrap; }
      @media(max-width:520px) { #sectionView .section-person-card { flex-wrap:wrap; } #sectionView .section-view-profile { margin-left:54px; } }
    </style>
    <div class="section-hero">
      <h2>Sections Directory</h2>
      <p>Your section is <strong>${escapeHTML(currentSection)}</strong>. Browse students and teachers in ICT Honesty and ICT Fidelity below. Select a name or picture to view a profile.</p>
    </div>
    <div class="section-groups">${sectionMarkup}</div>
  `;
}

function renderStudents() {

  if (currentUser?.role !== "teacher") return;



  const students = getUsers().filter((user) =>

    user.role === "student"

    && user.teacherId === currentUser.id

    && user.section === selectedStudentSection

  );



  setText("studentSectionHeading", selectedStudentSection);

  setText(

    "studentSectionDescription",

    `${students.length} student${students.length === 1 ? "" : "s"} in ${selectedStudentSection}.`

  );



  const container = $("studentDirectoryList");

  if (!container) return;



  container.innerHTML = students.length

    ? students.map((student) => {

      const tasks = getTasks().filter((task) =>

        task.teacherId === currentUser.id

        && (task.targetSection === "both"

          || task.targetSection === student.section)

      );



      const completed = tasks.filter((task) =>

        isTaskCompletedForUser(task, student.id)

      ).length;



      return `

        <article class="student-card">
          <button type="button" class="student-avatar profile-open-button"
            data-action="view-profile" data-id="${escapeHTML(student.id)}"
            aria-label="View ${escapeHTML(student.name)}'s profile">
            ${student.profilePicture ? `<img src="${escapeHTML(student.profilePicture)}" alt="">` : escapeHTML(initials(student.name))}
          </button>
          <div class="student-card-info">
            <h3><button type="button" class="profile-open-button profile-open-name"
              data-action="view-profile" data-id="${escapeHTML(student.id)}">${escapeHTML(student.name)}</button></h3>

            <p>${escapeHTML(student.section)}</p>

            <small>${completed} of ${tasks.length} tasks completed</small>

          </div>

        </article>

      `;

    }).join("")

    : `

      <div class="empty-state">

        <strong>No students in ${escapeHTML(selectedStudentSection)} yet</strong>

        <p>Students can register using your section and room password.</p>

      </div>

    `;



  const totalStudents = getUsers().filter((user) =>

    user.role === "student" && user.teacherId === currentUser.id

  ).length;



  setText(

    "studentCapacityText",

    `${totalStudents} student account${totalStudents === 1 ? "" : "s"} registered`

  );

  setText("capacityBadge", `${totalStudents} Students`);

}



function addStudent() {

  showToast(

    "Students should register using their LRN and your classroom details.",

    "error"

  );

}

/* =========================================================

   TEACHER PROGRESS

\========================================================= */



function renderTeacherProgress() {

  if (currentUser?.role !== "teacher") return;



  const container = $("teacherProgressTable");

  if (!container) return;



  const students = getUsers().filter((user) =>

    user.role === "student" && user.teacherId === currentUser.id

  );



  if (!students.length) {

    container.innerHTML = `

      <div class="empty-state">

        <strong>No students have joined yet</strong>

        <p>Students can register using your classroom details.</p>

      </div>

    `;

    return;

  }



  const tasks = getTasks().filter((task) =>

    task.teacherId === currentUser.id

  );



  container.innerHTML = `

    <table class="progress-table">

      <thead>

        <tr>

          <th>Student</th>

          <th>Section</th>

          <th>Completed</th>

          <th>Pending</th>

          <th>Progress</th>

        </tr>

      </thead>

      <tbody>

        ${students.map((student) => {

          const assigned = tasks.filter((task) =>

            task.targetSection === "both"

            || task.targetSection === student.section

          );



          const completed = assigned.filter((task) =>

            isTaskCompletedForUser(task, student.id)

          ).length;



          const pending = assigned.length - completed;

          const percent = assigned.length

            ? Math.round((completed / assigned.length) * 100)

            : 0;



          return `

            <tr>

              <td>${escapeHTML(student.name)}</td>

              <td>${escapeHTML(student.section)}</td>

              <td>${completed}</td>

              <td>${pending}</td>

              <td>

                <div class="progress-track">

                  <div class="progress-fill" style="width:${percent}%"></div>

                </div>

                <small>${percent}%</small>

              </td>

            </tr>

          `;

        }).join("")}

      </tbody>

    </table>

  `;

}



/* =========================================================

   CLASSROOM SETTINGS

\========================================================= */



function handleRoomSetup(event) {

  event.preventDefault();



  if (currentUser?.role !== "teacher") return;



  const section = $("roomSetupSection")?.value || "";

  const password = $("roomSetupPassword")?.value || "";

  const confirmPassword = $("roomSetupPasswordConfirm")?.value || "";



  setError("roomSetupError", "");



  if (!section || !password) {

    setError("roomSetupError", "Please complete all fields.");

    return;

  }



  if (password.length < 4) {

    setError("roomSetupError", "Room password must be at least 4 characters.");

    return;

  }



  if (password !== confirmPassword) {

    setError("roomSetupError", "Room passwords do not match.");

    return;

  }



  const users = getUsers();

  const index = users.findIndex((user) => user.id === currentUser.id);



  if (index < 0) return;



  users[index].section = section;

  users[index].roomPassword = password;



  if (!saveUsers(users)) return;



  currentUser = users[index];



  if ($("roomSetupForm")) $("roomSetupForm").reset();



  setError("roomSetupError", "");

  updateUserInterface();

  refreshAll();



  showToast("Classroom settings saved.");

}



/* =========================================================

   EVENT DELEGATION FOR DYNAMIC CARDS

\========================================================= */



function handleDynamicActions(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "close-profile") { closeProfileViewer(); return; }
  if (action === "view-profile") { if (id) openProfileViewer(id); return; }
  if (!id) return;
  switch (action) {
    case "edit-task": {
      const task = getTasks().find((item) =>
        item.id === id && item.teacherId === currentUser?.id
      );
      if (task) openTaskForm(task);
      break;
    }

    case "delete-task":
      deleteTask(id);
      break;

    case "toggle-task":
      toggleTaskCompletion(id);
      break;

    case "task-comment": {
      const input = button.closest(".task-card")?.querySelector("[data-task-comment-input]");
      addTaskComment(id, input);
      break;
    }

    case "toggle-task-comments":
      toggleComments(button, ".task-comments");
      break;

    case "edit-task-comment":
      editOrDeleteComment("task", id, button.dataset.commentId, "edit");
      break;

    case "delete-task-comment":
      editOrDeleteComment("task", id, button.dataset.commentId, "delete");
      break;

    case "announcement-comment": {
      const input = button.closest(".announcement-card")?.querySelector("[data-announcement-comment-input]");
      addAnnouncementComment(id, input);
      break;
    }

    case "toggle-announcement-comments":
      toggleComments(button, ".announcement-comments");
      break;

    case "edit-announcement-comment":
      editOrDeleteComment("announcement", id, button.dataset.commentId, "edit");
      break;

    case "delete-announcement-comment":
      editOrDeleteComment("announcement", id, button.dataset.commentId, "delete");
      break;

    case "delete-announcement":
      deleteAnnouncement(id);
      break;

    default:
      break;
  }
}


function refreshAll() {

  if (!currentUser) return;



  updateUserInterface();

  renderTasks();

  renderAnnouncements();



  if (currentUser.role === "teacher") {

    renderStudents();

    renderTeacherProgress();

  } else if (currentUser.role === "student" && currentView === "section") {

    renderSectionView();

  }

}



/* =========================================================

   EVENT LISTENERS

\========================================================= */



function bind(id, eventName, callback) {

  const element = $(id);

  if (element) element.addEventListener(eventName, callback);

}



function initializeEventListeners() {

  bind("studentRoleBtn", "click", () => selectRole("student"));

  bind("teacherRoleBtn", "click", () => selectRole("teacher"));



  bind("loginForm", "submit", handleLogin);

  bind("teacherRegisterForm", "submit", handleTeacherRegistration);

  bind("studentRegisterForm", "submit", handleStudentRegistration);



  bind("showTeacherRegister", "click", () => showAuthPanel("teacher"));

  bind("showStudentRegister", "click", () => showAuthPanel("student"));

  bind("backFromTeacherRegister", "click", () => showAuthPanel("login"));

  bind("backFromStudentRegister", "click", () => showAuthPanel("login"));



  bind("passwordToggle", "click", () => {

    const input = $("loginPassword");

    if (!input) return;



    const visible = input.type === "password";

    makePasswordInputVisible("loginPassword", visible);



    const button = $("passwordToggle");

    if (button) {

      button.textContent = visible ? "🙈" : "👁";

      button.setAttribute(

        "aria-label",

        visible ? "Hide password" : "Show password"

      );

    }

  });



  bind("logoutBtn", "click", logout);



  bind("profileForm", "submit", handleProfileSave);

  bind("removeProfilePictureBtn", "click", removeProfilePicture);



  bind("taskForm", "submit", handleTaskSubmit);

  bind("addTaskBtn", "click", () => openTaskForm());

  bind("cancelTaskBtn", "click", cancelTaskForm);



  bind("taskSearch", "input", renderTasks);

  bind("taskFilter", "change", renderTasks);

  bind("taskTypeFilter", "change", renderTasks);



  bind("announcementForm", "submit", handleAnnouncementSubmit);

  bind("addAnnouncementBtn", "click", openAnnouncementForm);

  bind("cancelAnnouncementBtn", "click", cancelAnnouncementForm);



  bind("roomSetupForm", "submit", handleRoomSetup);



  bind("addStudentForm", "submit", (event) => {

    event.preventDefault();

    addStudent();

  });



  $$(".nav-btn").forEach((button) => {

    button.addEventListener("click", () => navigateFromButton(button));

  });



  $$("[data-go]").forEach((button) => {

    button.addEventListener("click", () => navigateFromButton(button));

  });



  $$(".student-section-btn").forEach((button) => {

    button.addEventListener("click", () => {

      selectedStudentSection = button.dataset.studentSection || SECTIONS[0];



      $$(".student-section-btn").forEach((item) => {

        const active = item === button;

        item.classList.toggle("active", active);

        item.setAttribute("aria-pressed", String(active));

      });



      renderStudents();

    });

  });



  document.addEventListener("click", handleDynamicActions);



  // Enter in the comment field also submits the comment.

  document.addEventListener("keydown", (event) => {

    if (event.key !== "Enter" || event.shiftKey) return;



    const target = event.target;



    if (!(target instanceof HTMLInputElement)) return;



    if (target.matches("[data-task-comment-input]")) {

      event.preventDefault();

      addTaskComment(target.dataset.taskId, target);

    } else if (target.matches("[data-announcement-comment-input]")) {

      event.preventDefault();

      addAnnouncementComment(target.dataset.announcementId, target);

    }

  });

}



/* =========================================================

   START APPLICATION

\========================================================= */



function initializeSchoovaMate() {

  initializeStorage();

  ensureStudentClassroomFields();

  initializeEventListeners();



  showAuthPanel("login");

  setVisible("dashboardPage", false);

  setVisible("authPage", true);



  restoreLogin();

}



if (document.readyState === "loading") {

  document.addEventListener("DOMContentLoaded", initializeSchoovaMate);

} else {

  initializeSchoovaMate();

}
