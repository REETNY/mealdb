
// App Logic
const appBody = document.querySelector(".app-cont");
const dishCont = document.querySelector("#eachDish");
const swiperWrapper = document.querySelector(".swiper-wrapper");
const searchBox = document.querySelector("#searchBox");
const submit = document.querySelector(".submit");
const form = document.querySelector("#form");
const overFlow = document.querySelector("#overFlow");
const listIng = overFlow.querySelector(".ingredients");

// calling fetch favourite meal function
fetchFavMeal();

// calling swiper js on load
swiper();

// loop to get 8 random meal by calling the getRandomDish function
for(let i = 1; i <= 8; i++){
    getRandomDish();
}


async function getRandomDish() {
    const serverResponse = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const resp = await serverResponse.json();
    const response = resp.meals[0];
    const data = response;
    showRanDish(data, true);
}

function showRanDish(mealData, isTrue = false) {
    const data = mealData;
    const eachDishCont = document.createElement("div");
    eachDishCont.classList.add("dishCont");

    eachDishCont.innerHTML = `
        ${isTrue ? `<span class="randomDish">Random Dish</span>` : ``}
        <div class="dishImg-cont">
            <img class="image" src="${data.strMealThumb}" alt="${data.strMeal}">
        </div>
        <div class="dish-details">
            <span class="dish-name">
                ${data.strMeal}
            </span>

            <button class="liked" id="liked"><i class="fa fa-heart" aria-hidden="true"></i></button>
        </div>
    `

    const imgClick = eachDishCont.querySelector(".image");
    imgClick.addEventListener("click", () => {
        getDishDetails(data);

    })

    const ID = data.idMeal;

    const liked = eachDishCont.querySelector("#liked");
    liked.addEventListener("click", (e) => {
        if(e.target.classList.contains("pink")){
            e.target.classList.remove("pink");
            removeMealFromLs(ID);
        }else{
            e.target.classList.add("pink");
            addMealToLs(ID)
        }
        fetchFavMeal();
        swiper();
    })

    dishCont.appendChild(eachDishCont);
}



// local storage logic

function getMealIdFromLs() {
    const mealsIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealsIds === null ? [] : mealsIds;
}

function addMealToLs(mealId) {
    const mealIds = getMealIdFromLs();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLs(mealId) {
    let mealIds = getMealIdFromLs();

    mealIds = mealIds.filter( meal => meal != mealId);
    localStorage.setItem("mealIds", JSON.stringify(mealIds));
}



// fetch favourite meal with id function

async function getFavMeal(id) {
    const serverResponse = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const resp = await serverResponse.json();
    const response = resp.meals[0];
    const data = response;
    return data;
}


function fetchFavMeal() {
    const mealIds = getMealIdFromLs()
    swiperWrapper.innerHTML = ``;
    mealIds.forEach( async(meal) => {
        const mealData = await getFavMeal(meal);
        showFavDish(mealData);
        swiper();
    })
}


function showFavDish(mealData) {
    const data = mealData;

    const ID = data.idMeal;

    const favCont = document.createElement("div");
    favCont.classList.add("swiper-slide");
    favCont.innerHTML = `
        <span class="remove"><i class="fa fa-times" aria-hidden="true"></i></span>
        <div class="img-cont">
            <img class="image" src="${data.strMealThumb}" alt="${data.strMeal}">
        </div>
        <div class="favDishName">
            ${data.strMeal}
        </div>
    `

    const imgClick = favCont.querySelector(".image");
    imgClick.addEventListener("click", () => {
        getDishDetails(data);
    })

    const remove = favCont.querySelector(".remove");
    remove.addEventListener("click", () => {
        removeMealFromLs(ID);
        fetchFavMeal();
        swiper();
    })

    swiperWrapper.appendChild(favCont);
}




// search dish by name async function

async function searchDish(text) {
    const serverResponse = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + text);
    const resp = await serverResponse.json();
    const response = resp.meals;
    return response;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
})

submit.addEventListener("click", async() => {
    const userInput = searchBox.value;
    searchBox.value = "";
    if(userInput === "")return;

    dishCont.innerHTML = ``;
    const mealDatas = await searchDish(userInput);
    mealDatas.forEach( (meal) => {
        showRanDish(meal, false);
    })
})




// function to get all meal category
async function getMealCategory() {
    const serverResponse = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
    const resp = await serverResponse.json();
    const response = resp.categories;
    getCategories(response)
}
getMealCategory()


let categoryItems = [];

function getCategories(response){
    const data = response;
    data.forEach( (item) => {
        const itemData = item;
        for(let items in itemData){
            if(items == "strCategory"){
                categoryItems.push(itemData[items])
            }
        }
    })
    printOutCategory(categoryItems);
}





// get meal by category

const selectBox = document.querySelector("#selectBox");
const options = document.querySelector(".options");
const category = document.querySelector(".cate");
const icon = document.querySelector(".cate-icon");


async function filterByCategory(text) {
    const serverResponse = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c="+text);
    const resp = await serverResponse.json();
    const response = resp.meals;
    return response;
}

selectBox.addEventListener("click", (e) => {
    icon.classList.toggle("rotate")
    options.classList.toggle("openOption");
})    


function printOutCategory(array){
    options.innerHTML = "";
    const data = array;
    data.forEach( (item) => {
        const span = document.createElement("span");
        span.classList.add("opt");
        span.textContent = `${item}`;
        options.appendChild(span);
    })

    const opt = document.querySelectorAll(".opt");

    let userChoice;
    for(i=0; i<opt.length; i++){
        opt[i].addEventListener("click", async(e) => {
            category.textContent = (e.target.textContent);
            userChoice = (e.target.textContent);
            dishCont.innerHTML = '';
            const mealsData = await filterByCategory(userChoice);
            mealsData.forEach( async(meal) => {
                const dataMeal = await getFavMeal(meal.idMeal);
                showRanDish(dataMeal);
            });


            if(icon.classList.contains("rotate") && options.classList.contains("openOption")){
                icon.classList.remove("rotate")
                options.classList.remove("openOption");
            }

        })
    }

}




// swiper js wrapped inside a function
function swiper() {
    // swiper js control
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 30,
        pagination: {
        el: ".swiper-pagination",
        clickable: true,
        },
    });
}




// function to get dish details
function getDishDetails(mealData) {
    appBody.style.display = "none";
    overFlow.style.display = "block";
    overFlow.style.visibility = "visible";
    overFlow.innerHTML = ``;
    const data = mealData;

    let youtubeLink = data.strYoutube;
    if(youtubeLink.includes("watch?v=")){
        youtubeLink = youtubeLink.replace("watch?v=", "embed/");
    }

    let dishIngredients = [];

    for(const item in data){
        if(item.includes("strIngredient")){
            if(data[item] == null || data[item] == ""){
                continue;
            }else{
                dishIngredients.push(data[item]);
            }
        }
    }

    console.log(dishIngredients)

    overFlow.innerHTML = `
        <span class="close"><i class="fa fa-times" aria-hidden="true"></i></span>
        <div class="meal-category"> <span class="category">Category:</span> <span class="categoryClass">${data.strCategory}</span> </div>

        <div class="meal-name">${data.strMeal}</div>

        <div class="meal-pic">
            <img src="${data.strMealThumb}" alt="${data.strMeal}" class="fitted">
        </div>

        <div class="meal-ingredients">
            <span class="spec">ingredients:</span>
            <ul class="ingredients">
                
            </ul>
        </div>

        <div class="meal-instruction">
            <span class="instruct">Instruction</span>
            <span class="instruction">${data.strInstructions}</span>
        </div>

        <div class="meal-video">
            <iframe src="${youtubeLink}" frameborder="0"></iframe>
        </div>
    `

    const close = overFlow.querySelector(".close");
    close.addEventListener("click", () => {
        overFlow.style.display = "none";
        overFlow.style.visibility = "hidden";
        overFlow.innerHTML = ``;
        appBody.style.display = "block";
    })

    const listIng = overFlow.querySelector(".ingredients");
    
    function printIngredient() {
        listIng.innerHTML = '';

        for(let i = 0; i<dishIngredients.length; i++){
            const listItem = document.createElement("li");
            listItem.classList.add("ingredient");
            listItem.textContent = dishIngredients[i];
            listIng.appendChild(listItem);
        }
    }

    printIngredient();
}











// hamvurger logic
const main = document.querySelector("body");
const smallDevice = document.querySelector(".bg_screen");
const hamburger = document.querySelector(".hamburger");
hamburger.addEventListener("click", () => {
    
    if(smallDevice.classList.contains("openHam")){
        smallDevice.classList.remove("openHam");
        main.classList.remove("float");
        hamburger.innerHTML = `<i class="fa fa-bars" aria-hidden="true"></i>`
        hamburger.style.color = "black"
    }else{
        smallDevice.classList.add("openHam");
        main.classList.add("float");
        hamburger.innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`
        hamburger.style.color = "red";
    }
})