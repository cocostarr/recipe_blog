// CRUD OPERATIONS
let localDBS = JSON.parse(localStorage.getItem("posts")) || [];
console.log(localDBS)

// Get all elements from the DOM
const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("title");
const postBody = document.getElementById("body");
const postImage = document.getElementById("imageInput");
const showAllPostButton = document.getElementById("showAllPostsBtn");
const localPostContainer = document.getElementById("localPostsContainer");
const searchInput = document.getElementById("searchInput");
const previewImage = document.getElementById("previewImage"); 


function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();  // Use FileReader to read files in the browser.
        reader.onload = () => resolve(reader.result); 
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
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
    e.preventDefault();  // e.preventDefault() stops the page from refreshing when you submit the form.

    const newPost = {
        id: Date.now(),
        title: postTitle.value.trim(),
        body: postBody.value.trim(),
        image: currentImageBase64 || ""  
    };

    localDBS.push(newPost);
    localStorage.setItem("posts", JSON.stringify(localDBS)); // To make sure posts are saved even after refresh, save localDBS into localStorage.
    postForm.reset(); // Reset the form to blank.
    previewImage.style.display = "none";
    currentImageBase64 = ""; 
    alert("Recipe Created!");
});


// TO SHOW POSTS
function renderPosts(filter = "") { // Filters posts based on the search input (filter).
    localPostContainer.innerHTML = "";

    const filteredPosts = localDBS.filter(post => 
        post.title.toLowerCase().includes(filter.toLowerCase()) ||
        post.body.toLowerCase().includes(filter.toLowerCase())
    );

    filteredPosts.forEach(post => {
        const div = document.createElement("div");
        div.className = "postpost-container";
        div.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" />` : ""}
            <br>
            <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
            <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        `;
        localPostContainer.appendChild(div);
    });
}

// SEARCH POST
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim();
    renderPosts(keyword);
});

// Show All Post
showAllPostButton.addEventListener("click", () => renderPosts());

// EDIT POST
window.editPost = function(id) {
    const post = localDBS.find(p => p.id === id);
    if (post) {
        const newTitle = prompt("Edit title:", post.title);
        const newBody = prompt("Edit body:", post.body);
        post.title = newTitle || post.title;
        post.body = newBody || post.body;
        localStorage.setItem("posts", JSON.stringify(localDBS));
        renderPosts();
    }
};

// NOTE
// editPost() takes a function and finds the post with the matching ID.
// window. makes it accessible from the HTML button's onclick(edit button onclick).
// The prompt() is used to ask the user for a new title and body.
// The post.title is Updated to the values inside the array.


// DELETE POST
window.deletePost = function(id){
    localDBS = localDBS.filter(post => post.id !== id);
    localStorage.setItem("posts", JSON.stringify(localDBS)); // save update
    renderPosts();
}