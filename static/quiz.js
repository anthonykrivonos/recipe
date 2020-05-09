/**
 * Local Variables
 */

// Time the user starts the quiz
let startTime = null
let timer = null

let currentDish = null
let currentDishNum = 0

let step = null
let ingredients = []

const mistakes = []

let draggingIngredient = null

/**
 * Lifecycle Updates
 */

const addIngredient = ingredient => {
    if (!ingredient) {
        return
    }
    ingredients.push(ingredient)
    $(`.ingredient-name[ingredient='${ingredient}']`).html(`<span class="color-gray">${ingredient}</span>`)
    $(`.ingredient[ingredient='${ingredient}']`).hide()
    renderIngredients()
    nextStep()
}

const renderIngredients = () => {
    if (ingredients.length == 0) {
        $('#ingredient-list').html(`<span class="color-gray">No ingredients added.</span>`)
    } else if (ingredients.length == 1) {
        $('#ingredient-list').html(`
            <span class="color-gray">Added </span>${ingredients[0]}<span class="color-gray">.</span>
        `)
    } else if (ingredients.length == 2) {
        $('#ingredient-list').html(`
            <span class="color-gray">Added </span>${ingredients.join(`<span class="color-gray"> and </span>`)}<span class="color-gray">.</span>
        `)
    } else {
        $('#ingredient-list').html(`
            <span class="color-gray">Added </span>${ingredients.slice(0, ingredients.length - 1).join(`<span class="color-gray">, </span>`)}<span class="color-gray">, and </span>${ingredients[ingredients.length - 1]}<span class="color-gray">.</span>
        `)
    }
}

const addMistake = ingredient => {
    const correctIngredient = step.ingredient
    mistakes.push({
        ingredient,
        correctIngredient,
        dishName: currentDish.name
    })
    renderMistakes()
}

const renderMistakes = () => {
    $('#mistakes').html(`
        <div class="bold font-sm mt-4">${mistakes.length === 0} Mistake${mistakes.length !== 1 ? 's' : ''}</div>
        <div class="mistakes-inner mt-3 p-2">
            ${
                mistakes.map((mistake, idx) => `
                    <div class="other-dish d-flex flex-row justify-content-between color-dark-gray p-2">
                        <div>${idx + 1}. Added <span class="p-1 bg-red color-white">${mistake.ingredient}</span> instead of <span class="bold">${mistake.correctIngredient}</span>.</div>
                        <div class="color-gray bold">${mistake.dishName}</div>
                    </div>
                `).join('')
            }
        </div>
    `)
    $(".mistakes-inner").animate({
        scrollTop: $(".mistakes-inner").position().top
    }, 1000)
}

const renderCurrentDish = () => {
    $('#current_dish').html(`
        <div class="d-flex flex-column">
            <img class="dish-img raised" src="${currentDish.imageUrl}" alt="${currentDish.name}" />
            <div class="text-uppercase color-red bold font-sm">Currently Making</div>
            <div class="title bold font-lg">${currentDishNum + 1}. ${currentDish.name}</div>
            <div class="title font-sm">(Russian: ${currentDish.russianName})</div>
            <div class="font-sm color-gray mt-2 mb-3">${currentDish.tagline}</div>
        </div>
    `)
    $('#other_dishes').html(dishes.map((dish, idx) => dish.id === currentDish.id ? '' : `
        <div class="other-dish d-flex flex-row justify-content-between ${
            idx > currentDishNum ? 'bg-offwhite color-red' : 'bg-light-gray color-dark-gray'
        } p-2 mt-2 mb-2">
            <div class="color-dark-gray">${idx + 1}. ${dish.name}</div>
            <div class="bold">${idx == 2 ? 'LAST ONE' : idx > currentDishNum ? 'UP NEXT' : 'COMPLETED'}</div>
        </div>
    `).join(''))
}

const renderCabinet = () => {
    $("#cabinet").html(cabinets[currentDishNum].map(ingredient => `
        <div class="row">
            <div class="col-6 ingredient-col d-flex flex-row">
                <img class="ingredient" ingredient="${ingredient}" src="/static/assets/${ingredient}.svg" />
            </div>
            <div ingredient="${ingredient}" class="col-6 ingredient-name d-flex flex-row">${ingredient}</div>
        </div>
    `))
}

const updateStep = number => {
    if (currentDish && currentDish.steps && currentDish.steps.length > 0) {
        let didChange = false
        for (const dishStep of currentDish.steps) {
            if (dishStep.number === number) {
                step = dishStep
                didChange = true
                break
            }
        }
        if (didChange) {
            // Keep going
            $('#step').html(`
                <div class="text-uppercase color-red bold font-xs">Step ${number}</div>
                <div class="title bold font-md">${step.quizAction}</div>
                <div class="color-gray font-sm">Drag and drop the correct food item into the bowl.</div>
            `)
        } else {
            // User has completed the recipe
            currentDishNum++
            if (currentDishNum < 3) {
                currentDish = dishes[currentDishNum]
                ingredients = []
                renderCurrentDish()
                renderCabinet()
                updateStep(1)
                renderIngredients()
                initializeDragAndDrop()
            } else {
                // User finished!
                stopTimer()
                const score = getScore(new Date())
                addToLearderboard(getUserId(), score, new Date().getTime())
                $('#step').html(`
                    <div class="text-uppercase color-green bold font-xs">Completed</div>
                    <div class="title bold font-md">Congratulations!</div>
                    <div class="color-gray font-sm">You've completed the quiz.</div>
                `)
                confetti()
                // Show an alert
                let quizIds = getLearnedRecipes()
                const canGoToQuiz = quizIds.length >= 3
                showAlert('Congratulations!', `Your score is <span class="bold">${score}</span>. You're now a Russian food masterchef!`, 'Leaderboard', 'Home',
                    () => navigate(`/leaderboard`),
                    () => navigate(`/`)
                )
            }
        }
    }
}

const nextStep = () => {
    let currentStep = step != null ? step.number : null
    if (currentStep != null) {
        updateStep(++currentStep)
    }
}

const canAddIngredient = ingredient => {
    return ingredient && !ingredients.includes(ingredient)
}

const isCorrectIngredient = ingredient => {
    return ingredient && !ingredients.includes(ingredient) && step.ingredient === ingredient && currentDish.ingredients.includes(ingredient)
}

/**
 * Dragging
 */

const onDragStart = (event, ui) => {
    draggingIngredient = ui.helper
    draggingIngredient.toggleClass("draggable", true)
    const ingredient = draggingIngredient.attr('ingredient')
    if (canAddIngredient(ingredient)) {
        $("#bowl").toggleClass("droppable", true)
    } else {
        $("#bowl").toggleClass("undroppable", true)
    }
}

const onDragStop = (event, ui) => {
    $("#bowl").toggleClass("droppable", false)
    $("#bowl").toggleClass("undroppable", false)
    ui.helper.toggleClass("draggable", false)
    draggingIngredient = null
}

const onRevert = () => {
    $("#bowl").toggleClass("droppable", false)
    $("#bowl").toggleClass("undroppable", false)
    $("#bowl").toggleClass("aboutta-drop", false)
    if (draggingIngredient) {
        draggingIngredient.toggleClass("draggable", false)
    }
    return true
}

/**
 * Dropping
 */

const onDrop = (event, ui) => {
    const ingredient = ui.draggable.attr('ingredient')
    if (canAddIngredient(ingredient) && isCorrectIngredient(ingredient)) {
        // Can drop
        addIngredient(ingredient)
    } else {
        // User inserted the wrong ingredient
        addMistake(ingredient)
    }
    $("#bowl").toggleClass("droppable", false)
    $("#bowl").toggleClass("undroppable", false)
    $("#bowl").toggleClass("aboutta-drop", false)
}

const onDragOver = (event, ui) => {
    const ingredient = ui.draggable.attr('ingredient')
    if (canAddIngredient(ingredient)) {
        // Can drop
        $("#bowl").toggleClass("aboutta-drop", true)
    }
}

const onDragOut = () => {
    $("#bowl").toggleClass("aboutta-drop", false)
}

const initializeDragAndDrop = () => {
    $('#bowl-dropzone').droppable( {
        drop: onDrop,
        over: onDragOver,
        out: onDragOut,
    })
    $(".ingredient").draggable({
        revert: onRevert,
        stack: ".ingredient",
        start: onDragStart,
        stop: onDragStop,
        cursor: 'move',
    })
}

const startTimer = (t) => {
    startTime = new Date()
    timer = setInterval(() => {
        const dateDiff = new Date(new Date().getTime() - startTime.getTime())
        t.html(`${pad(dateDiff.getMinutes(), 2)}:${pad(dateDiff.getSeconds(), 2)}:${pad(dateDiff.getMilliseconds(), 2)}`)
    }, 10)
}

const stopTimer = () => {
    clearInterval(timer)
}

const getScore = (endDate) => {
    // Calculates a user's score
    const BASE_SCORE = 50
    const diff = new Date(endDate.getTime() - startTime.getTime()).getTime()
    const score = Math.max(Math.floor(Math.pow(diff, -1) * 10e8) - mistakes.length * 1000, BASE_SCORE)
    return score
}

const addToLearderboard = (userId, score, date) => {
    $.ajax({
        type: "POST",
        url: "/add_to_leaderboard",                
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify({
            user_id: userId,
            score,
            date
        }),
        success: (result) => {
            const leaderboard = result["leaderboard"]
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}

const togglePage = (showQuiz = false) => {
    if (showQuiz) {
        $("#introPage").hide()
        $("#quizPage").show()
    } else {
        $("#quizPage").hide()
        $("#introPage").show()
    }
}

const startQuiz = () => {
    togglePage(true)
    stopTimer()

    // Set the current dish
    currentDish = dishes[currentDishNum]

    // Set the first dish
    renderCurrentDish()
    renderCabinet()
    renderMistakes()

    // First step in the recipe
    updateStep(1)
    
    initializeDragAndDrop()

    startTimer($('#time'))
}

/**
 *  Events
 */
$(document).ready(() => {

    startTimer($('#time-example'))
    $('.carousel').carousel("pause")

    togglePage(false)
    $(".start-quiz-button").click(startQuiz)
    
})