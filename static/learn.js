/**
 * Local Variables
 */

let step = null
let ingredients = []

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
    nextStep()
}

const updateStep = number => {
    if (dishData && dishData.steps && dishData.steps.length > 0) {
        let didChange = false
        for (const dishStep of dishData.steps) {
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
                <div class="title bold font-md">${step.action}</div>
                <div class="color-gray font-sm">Drag and drop the ${step.ingredient} into the bowl.</div>
            `)
        } else {
            // User has completed the recipe
            $('#step').html(`
                <div class="text-uppercase color-green bold font-xs">Completed</div>
                <div class="title bold font-md">Nice work!</div>
                <div class="color-gray font-sm">You've just made ${dishData.name}.</div>
            `)
            confetti()
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
    return ingredient && step && step.ingredient === ingredient && dishData.ingredients.includes(ingredient) && !ingredients.includes(ingredient)
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
    if (canAddIngredient(ingredient)) {
        // Can drop
        addIngredient(ingredient)
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

/**
 *  Events
 */
$(document).ready(() => {
    // First step in the recipe
    updateStep(1)
    
    
    $('#bowl').droppable( {
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
})