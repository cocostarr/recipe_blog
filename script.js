// CRUD OPERATIONS
let localDBS = JSON.parse(localStorage.getItem("posts")) || [];
console.log(localDBS)

// Get all elements from the DOM
const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("title");
const postBody = document.getElementById("body");
const postImage = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage"); 
const submitBtn = document.getElementById("submitBtn");

const showAllPostButton = document.getElementById("showAllPostsBtn");
const localPostContainer = document.getElementById("localPostsContainer");
const searchInput = document.getElementById("searchInput");

let isEditing = false;
let editId = null;

// Converts a file to a base64 string so it can be saved in localStorage.
function toBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();  // Use FileReader to read files in the browser.
        reader.onload = () => resolve(reader.result); 
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

function saveToStorage(){
    localStorage.setItem("posts", JSON.stringify(localDBS));
}

// Custom Alert
function showCustomAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertText = document.getElementById("alertMessage");

    if (!alertBox || !alertText) return;

    alertText.textContent = message;
    alertBox.classList.add("show");

    // Remove any previous scroll listener and timer
    clearTimeout(alertBox.hideTimeout);
    window.removeEventListener("scroll", alertBox.scrollHandler);

    // Hide after 3 seconds
    alertBox.hideTimeout = setTimeout(() => {
        alertBox.classList.remove("show");
    }, 3000);

    // Hide on scroll
    alertBox.scrollHandler = () => {
        alertBox.classList.remove("show");
        clearTimeout(alertBox.hideTimeout);
        window.removeEventListener("scroll", alertBox.scrollHandler);
    };

    window.addEventListener("scroll", alertBox.scrollHandler);
}


// PREVIEW IMAGE ON SELECTION
let currentImageBase64 = ""; 

postImage.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            currentImageBase64 = await toBase64(file);
            previewImage.src = currentImageBase64;
            previewImage.style.display = "block";
        } catch (err) {
            console.error("Image conversion failed:", err);
        }
    }
});

// TO CREATE POST
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = postTitle.value.trim();
    const body = postBody.value.trim();

    if (!title || !body) {
        showCustomAlert("Title and body are required.");
        return;
    }

    if (isEditing) {
        const index = localDBS.findIndex(post => post.id === editId);
        if (index !== -1) {
            localDBS[index].title = title;
            localDBS[index].body = body;
            if (currentImageBase64) {
                localDBS[index].image = currentImageBase64;
            }
        }
        showCustomAlert("✔ Recipe Updated!");
    } else {
        const newPost = {
            id: Date.now(),
            title,
            body,
            image: currentImageBase64 || ""
        };
        localDBS.push(newPost);
        showCustomAlert("✔ Recipe Created!");
    }

    saveToStorage();
    postForm.reset();
    previewImage.style.display = "none";
    currentImageBase64 = "";
    isEditing = false;
    editId = null;
    submitBtn.textContent = "Create Post";
    renderPosts();
});


// TO SHOW POSTS
function renderPosts(filter = ""){
    localPostContainer.innerHTML = "";

    const filteredPosts = localDBS.filter(post => 
        post.title.toLowerCase().includes(filter.toLowerCase()) ||
        post.body.toLowerCase().includes(filter.toLowerCase())
    );

    filteredPosts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "postpost-container";
        postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" />` : ""}
            <br>
            <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        `;
        localPostContainer.appendChild(postDiv);
    });
}

// SEARCH POST
searchInput.addEventListener("input", () => {
    renderPosts(searchInput.value.trim());
});


// SHOW ALL POST
showAllPostButton.addEventListener("click", () => {
    renderPosts();
});


// EDIT POST
window.editPost = function(id) {
    const post = localDBS.find(p => p.id === id);
    if (post) {
        postTitle.value = post.title;
        postBody.value = post.body;
        previewImage.src = post.image;
        previewImage.style.display = post.image ? "block" : "none";
        currentImageBase64 = post.image;
        isEditing = true;
        editId = id;
        submitBtn.textContent = "Update Post";
    }
};

// DELETE POST
window.deletePost = function(id){
    localDBS = localDBS.filter(post => post.id !== id);
    saveToStorage();
    renderPosts();
}