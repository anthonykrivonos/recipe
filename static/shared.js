/**
 * Query Functions
 */
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search)
    const paramValue = urlParams.get(param)
    return paramValue ? paramValue : ''
}

const goHome = () => {
    window.location = `/`
}

const goToSearch = (text) => {
    window.location = `/?search=${text}`
}

const goToView = (id) => {
    window.location = `/view/${id}`
}

/**
 * Data Functions
 */
const search = (text, onSuccess, onError) => {
    $.ajax({
        type: "POST",
        url: "/search",                
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify({
            search: text
        }),
        success: (result) => {
            const data = result["data"]
            onSuccess && onSuccess(data)
        },
        error: function(request, status, error){
            onError && onError(request, status, error)
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}

const update = (id, key, value, onSuccess, onError) => {
    $.ajax({
        type: "POST",
        url: "/update",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify({
            id,
            key,
            value
        }),
        success: (result) => {
            const player = result["player"]
            onSuccess && onSuccess(player)
        },
        error: function(request, status, error){
            onError && onError(request, status, error)
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}

const deleteGame = (playerId, gameIdx, doDelete, onSuccess, onError) => {
    $.ajax({
        type: "POST",
        url: "/delete_game",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify({
            player_id: playerId,
            game_id: gameIdx,
            delete: doDelete
        }),
        success: (result) => {
            const games = result["games"]
            onSuccess && onSuccess(games)
        },
        error: function(request, status, error){
            onError && onError(request, status, error)
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}

const getAutocompleteNames = (onSuccess, onError) => {
    $.ajax({
        type: "GET",
        url: "/autocomplete_names",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        success: (result) => {
            const names = result["names"]
            onSuccess && onSuccess(names)
        },
        error: function(request, status, error){
            onError && onError(request, status, error)
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}


/**
 * Validation Functions
 */

const raiseInputError = (el) => el.toggleClass('error-border', true) && el.focus()
const lowerInputError = (el) => el.toggleClass('error-border', false)
const showErrorText = (el, msg) => el.html(msg) && el.show()
const hideErrorText = (el) => el.html('') && el.hide()

/**
 * Style Functions
 */

const teamColorCode = (teamName) => {
    return {
        "Hawks": "#CC092F",
        "Celtics": "#008853",
        "Nets": "#000000",
        "Hornets": "#1D8CAB",
        "Bulls": "#BC032B",
        "Cavaliers": "#860038",
        "Mavericks": "#1061AC",
        "Nuggets": "#FDB827",
        "Pistons": "#ED174C",
        "Warriors": "#006BB6",
        "Rockets": "#D31145",
        "Pacers": "#FFC526",
        "Clippers": "#D81D47",
        "Lakers": "#542583",
        "Grizzlies": "#23375B",
        "Heat": "#BF2F38",
        "Bucks": "#00461B",
        "Timberwolves": "#005183",
        "Pelicans": "#B5985A",
        "Knicks": "#F48328",
        "Thunder": "#0A7EC2",
        "Magic": "#0075BD",
        "76ers": "#003DA5",
        "Suns": "#27235C",
        "Trail Blazers": "#E13A3E",
        "Kings": "#724C9F",
        "Spurs": "#84888B",
        "Raptors": "#BE0F34",
        "Jazz": "#0C2340",
        "Wizards": "#E51837"
    }[teamName] || '#000000'
}