let selectedTags = {}
let learnedRecipes = []

const renderTags = () => {
    $("#tags").html(allTags.map((tag, idx) => {
        const align = idx % 2 === 0 ? 'align-self-start' : 'align-self-end'
        if (selectedTags[tag]) {
            return `<div class="mt-2 mb-2 ${align}"><button tag="${tag}" class="btn tag-btn bg-white">${tag}</button></div>`
        }
        return `<div class="mt-2 mb-2 ${align}"><button tag="${tag}" class="btn tag-btn color-gray bg-light-gray lowered">${tag}</button></div>`
    }).join(''))
    for (const tag in selectedTags) {
        $(`.tag-btn[tag='${tag}']`).click(() => updateQuery(tag))
    }
}

const renderDishes = () => {
    $("#dishes").html(allDishes.map(dish => {
        const learned = learnedRecipes.includes(dish.id)
        return `
        <div dish-id="${dish.id}" class="panel dish-card ml-1 p-4 ${learned ? 'bg-light-gray' : 'bg-red'} btn raised text-left d-flex flex-column justify-content-between">
            <div class="d-flex justify-content-between align-items-center">
                <div class="${learned ? 'color-dark-gray' : 'color-light-gray'}">${dish.tags.join(', ')}</div>
                ${!learned ? `<div class="bold font-xs ${learned ? 'color-dark-gray' : 'color-light-gray'}">★ New</div>` : ''}
            </div>
            <div class="position-relative d-flex flex-column align-items-end">
                <img class="dish-img raised" src="${dish.imageUrl}" />
            </div>
            <div>
                <div class="title bold font-xl">${dish.name}</div>
                <div class="title font-md">(Russian: ${dish.russianName})</div>
                <div class="${learned ? 'color-dark-gray' : 'color-light-gray'} font-sm mt-2 tagline">${dish.tagline}</div>
            </div>
        </div>
        `
    }).join(''))
    $(`.dish-card`).click(function () { navigate(`/info/${$(this).attr('dish-id')}`) })
}

const updateQuery = tag => {
    selectedTags[tag] = selectedTags[tag] ? false : true
    let query = []
    let numSelected = 0
    for (const tag in selectedTags) {
        if (selectedTags[tag]) {
            query.push(tag)
            numSelected++
        }
    }
    if (numSelected === allTags.length) {
        query = ''
    } else {
        query = query.join(',')
    }
    setQueryParam('query', query)
}

$(document).ready(function(){

    // Get learned recipes
    learnedRecipes = getLearnedRecipes()

    // Set searchable tags
    let query = getQueryParam('query')
    if (query) {
        query = query.split(',')
    }
    for (const tag of allTags) {
        selectedTags[tag] = !query || query.includes(tag)
    }



    renderTags()
    renderDishes()

})