// Story World - Story Reader

let storyPages = [];
let currentPage = 0;
let currentStory = "";

// Divide the generated story into readable pages
function splitStoryIntoPages(story) {
    const words = story.split(/\s+/);
    const pages = [];
    const wordsPerPage = 110;

    for (let i = 0; i < words.length; i += wordsPerPage) {
        pages.push(
            words.slice(i, i + wordsPerPage).join(" ")
        );
    }

    return pages;
}

// Display the selected story page
function displayPage() {
    const storyPage = document.getElementById("storyPage");
    const pageNumber = document.getElementById("pageNumber");
    const pageCount = document.getElementById("pageCount");

    storyPage.textContent = storyPages[currentPage];

    pageNumber.textContent = "Page " + (currentPage + 1);
    pageCount.textContent =
        "Page " + (currentPage + 1) + " of " + storyPages.length;

    document.getElementById("previousBtn").disabled =
        currentPage === 0;

    document.getElementById("nextBtn").disabled =
        currentPage === storyPages.length - 1;
}// Generate a new AI story

async function generateStory() {
    const idea = document.getElementById("storyIdea").value.trim();
    const genre = document.getElementById("genre").value;
    const length = document.getElementById("length").value;
    const status = document.getElementById("status");
    const button = document.getElementById("generateBtn");

    if (!idea) {
        status.textContent = "Please enter a story idea first.";
        return;
    }

    button.disabled = true;
    status.textContent = "✨ Creating your magical story...";

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: idea,
                genre: genre,
                length: length
            })
        });

        if (!response.ok) {
            throw new Error("Story generation failed.");
        }

        const data = await response.json();

        currentStory = data.story;
        storyPages = splitStoryIntoPages(currentStory);
        currentPage = 0;

        document.getElementById("storyTitle").textContent =
            idea.length > 45 ? idea.slice(0, 45) + "..." : idea;

        document.getElementById("storyResult").style.display = "block";

        displayPage();

        status.textContent = "✨ Your story is ready!";
        document.getElementById("storyResult").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        status.textContent =
            "Unable to create your story. Please check that Flask and your AI service are running.";
        console.error(error);
    } finally {
        button.disabled = false;
    }
}

document.getElementById("generateBtn").addEventListener(
    "click",
    generateStory
);// Move to the previous story page

document.getElementById("previousBtn").addEventListener("click", function () {
    if (currentPage > 0) {
        currentPage--;
        displayPage();
    }
});

// Move to the next story page

document.getElementById("nextBtn").addEventListener("click", function () {
    if (currentPage < storyPages.length - 1) {
        currentPage++;
        displayPage();
    }
});// Copy the complete story

document.getElementById("copyBtn").addEventListener("click", async function () {
    try {
        await navigator.clipboard.writeText(currentStory);
        document.getElementById("status").textContent =
            "✨ Story copied successfully!";
    } catch (error) {
        document.getElementById("status").textContent =
            "Unable to copy. Please try again.";
    }
});

// Create another story

document.getElementById("againBtn").addEventListener("click", function () {
    document.getElementById("storyIdea").value = "";
    document.getElementById("storyResult").style.display = "none";
    document.getElementById("status").textContent = "";

    currentStory = "";
    storyPages = [];
    currentPage = 0;

    document.getElementById("creator").scrollIntoView({
        behavior: "smooth"
    });
});