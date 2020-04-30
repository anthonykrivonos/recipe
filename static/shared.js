/**
 * URL Functions
 */

const navigate = (url) => {
    window.location = url
}

/**
 * Query Functions
 */

const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search)
    const paramValue = urlParams.get(param)
    return paramValue ? paramValue : ''
}

const setQueryParam = (param, value) => {
    window.location.search = `${param}=${value}`
}

/**
 * Local Storage Functions
 */

const USER_ID_KEY = "userId"
const RECIPE_LIST_KEY = "recipeList"

const setUserId = (userId = null) => {
    try {
        if (userId) {
            localStorage.setItem(USER_ID_KEY, userId)
        } else {
            userId = localStorage.getItem(USER_ID_KEY)
            if (!userId) {
                userId = createUserId()
                localStorage.setItem(USER_ID_KEY, userId)
            }
        }
        return userId
    } catch {}
    return null
}

const createUserId = () => {
    return `User_${1000 + Math.floor(Math.random() * 9000)}`
}

const getUserId = () => {
    try {
        return localStorage.getItem(USER_ID_KEY)
    } catch {}
    return null
}

const hasUserId = () => {
    return getUserId() != null
}

const setLearnedRecipes = (recipeList) => {
    try {
        localStorage.setItem(RECIPE_LIST_KEY, JSON.stringify(recipeList))
        return recipeList
    } catch {
        localStorage.setItem(RECIPE_LIST_KEY, JSON.stringify([]))
        return []
    }
}

const getLearnedRecipes = () => {
    try {
        const recipeListJSON = localStorage.getItem(RECIPE_LIST_KEY)
        if (recipeListJSON) {
            const recipeList = JSON.parse(recipeListJSON)
            if (recipeList && Array.isArray(recipeList)) {
                return recipeList
            }
        }
    } catch {}
    return []
}

const addLearnedRecipe = (id) => {
    const recipeList = getLearnedRecipes()
    if (!recipeList.includes(id)) {
        recipeList.push(id)
        setLearnedRecipes(recipeList)
    }
    return recipeList
}

const removeLearnedRecipe = (id) => {
    const recipeList = getLearnedRecipes()
    const idx = recipeList.indexOf(id)
    if (idx > -1) {
        recipeList.splice(idx, 1)
    }
    setLearnedRecipes(recipeList)
    return recipeList
}

const hasLearnedRecipe = (id) => {
    const recipeList = getLearnedRecipes()
    return recipeList.indexOf(id) !== -1
}

const hasLearnedRecipes = () => {
    return recipeList.length > 0
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    return a
}

/**
 * Alerts
 */

const showAlert = (title, body, successText, otherText, onSuccess = ()=>{}, onOther = ()=>{}, onClose = ()=>{}) => {
    const id = Math.floor(Date.now() % 1e8).toString()
    $('body').append(`
        <div id="${id}" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header p-4">
                    <h5 class="modal-title">${title}</h5>
                    <button id="${id}_close" type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span class="font-md" aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${body}</p>
                </div>
                <div class="modal-footer">
                    <button id="${id}_success" type="button" class="btn bg-red color-white">${successText}</button>
                    <button id="${id}_other" type="button" class="btn bg-light-gray" data-dismiss="modal">${otherText}</button>
                </div>
                </div>
            </div>
        </div>
    `)
    $(`#${id}_success`).click(onSuccess)
    $(`#${id}_other`).click(onOther)
    $(`#${id}_close`).click(onClose)
    $(`#${id}`).modal('show')
    return $(`#${id}`)
}

/**
 * String manipulation.
 */

const pad = (n, width, z = '0') => {
    n = n.toString()
    return n.length >= width ? n.slice(0, width) : new Array(width - n.length + 1).join(z) + n
}

/**
 * Confetti Functions
 */

const confetti = (count = 75) => {
    for (var i = 0; i < count; i++) {
        create(i)
    }
}

const create = (i) => {
    const width = Math.random() * 8;
    const height = width * 0.4;
    const colorIdx = Math.ceil(Math.random() * 3);

    let color = "#ea9999ff"

    switch(colorIdx) {
        case 1:
            color = "#f4ccccff";
            break;
        case 2:
            color = "#e06666ff";
            break;
        default:
            color = "#ea9999ff";
    }

    $(`<div class="confetti-${i}"></div>`).css({
        "background-color": color,
        "width": width+"px",
        "height": height+"px",
        "top": -Math.random()*20+"%",
        "left": Math.random()*100+"%",
        "opacity": Math.random()+0.5,
        "transform": "rotate("+Math.random()*360+"deg)",
        "position": "absolute",
    }).appendTo('body')

    drop(i)
}

const drop = (x) => {
    $('.confetti-'+x).animate({
        top: "100%",
        left: "+="+Math.random()*15+"%"
    }, Math.random() * 3000 + 3000, () => {
        reset(x)
    })
}

const reset = (x) => {
    $('.confetti-'+x).animate({
    "top" : -Math.random()*20+"%",
    "left" : "-="+Math.random()*15+"%"
    }, 0, () => {
        drop(x)
    })
}