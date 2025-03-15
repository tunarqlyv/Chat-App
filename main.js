// main.js
import { auth, db } from './firebase-config.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  ref,
  set,
  push,
  onChildAdded,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const loginContainer = document.getElementById("loginContainer");
const chatContainer = document.getElementById("chatContainer");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");

const searchFriendBtn = document.getElementById("searchFriendBtn");
const friendSearchInput = document.getElementById("friendSearchInput");
const friendInfo = document.getElementById("friendInfo");

let currentUser = null;
let currentChatFriend = null;

// Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      loginMessage.textContent = "Login successful";
    })
    .catch(error => {
      loginMessage.textContent = `Login Failed: ${error.message}`;
    });
});

// Signup
signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      set(ref(db, "users/" + user.uid), {
        email: user.email
      });
      loginMessage.textContent = "Signup successful";
    })
    .catch(error => {
      loginMessage.textContent = `Signup Failed: ${error.message}`;
    });
});

// Auth State Change
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loginContainer.style.display = "none";
    chatContainer.style.display = "block";
  } else {
    currentUser = null;
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  }
});
// Display.name
signupBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const displayName = document.getElementById("displayName").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Display name əlavə edirik
            updateProfile(user, { displayName: displayName })
                .then(() => {
                    // Database-ə də yazırıq istifadəçini
                    set(ref(db, "users/" + user.uid), {
                        email: email,
                        displayName: displayName,
                    });

                    loginMessage.textContent = "Sign up successful! You can now log in.";
                })
                .catch((error) => {
                    loginMessage.textContent = "Profile update failed: " + error.message;
                });

        })
        .catch((error) => {
            loginMessage.textContent = "Sign up failed: " + error.message;
        });
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});
// FriendShearchInput
document.getElementById("searchFriendBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("friendSearchInput").value.toLowerCase();

    get(child(ref(db), "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            let found = false;
            for (const uid in users) {
                if (
                    users[uid].displayName &&
                    users[uid].displayName.toLowerCase().includes(searchTerm)
                ) {
                    found = true;
                    document.getElementById("friendInfo").innerText =
                        "User found: " + users[uid].displayName + " (" + users[uid].email + ")";
                    break;
                }
            }

            if (!found) {
                document.getElementById("friendInfo").innerText = "User not found!";
            }
        } else {
            document.getElementById("friendInfo").innerText = "No users in database!";
        }
    });
});
// Login zamani isdifadeci adi gosdermek
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginContainer.style.display = "none";
        chatContainer.style.display = "block";

        const welcomeText = `Welcome, ${user.displayName || user.email}!`;
        document.querySelector("#chatContainer h2").textContent = welcomeText;
    }
});

// Search Friend
searchFriendBtn.addEventListener("click", async () => {
  const searchEmail = friendSearchInput.value;

  const snapshot = await get(ref(db, "users"));
  let found = false;

  snapshot.forEach(childSnapshot => {
    const userData = childSnapshot.val();
    if (userData.email === searchEmail && userData.email !== currentUser.email) {
      friendInfo.textContent = `Friend Found: ${userData.email}`;
      currentChatFriend = childSnapshot.key;
      messagesDiv.innerHTML = "";
      loadMessages(currentChatFriend);
      found = true;
    }
  });

  if (!found) {
    friendInfo.textContent = "Friend not found or cannot message yourself.";
    currentChatFriend = null;
  }
});

// Send Message
sendBtn.addEventListener("click", () => {
  if (!currentChatFriend) {
    alert("Select a friend to chat first.");
    return;
  }

  const message = messageInput.value.trim();
  if (message === "") return;

  const messageRef = ref(db, `messages/${currentUser.uid}_${currentChatFriend}`);
  push(messageRef, {
    sender: currentUser.email,
    text: message,
    timestamp: Date.now()
  });

  messageInput.value = "";
});

// Load Messages
function loadMessages(friendId) {
  const messageRef = ref(db, `messages/${currentUser.uid}_${friendId}`);
  onChildAdded(messageRef, snapshot => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.textContent = `${msg.sender}: ${msg.text}`;
    messagesDiv.appendChild(div);
  });

  const reverseRef = ref(db, `messages/${friendId}_${currentUser.uid}`);
  onChildAdded(reverseRef, snapshot => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    div.textContent = `${msg.sender}: ${msg.text}`;
    messagesDiv.appendChild(div);
  });
}
