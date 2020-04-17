const viewPlayer = (id) => {
    location.href = `/view/${id}`;
}

const searchPlayers = () => {
    location.href = '/'
}

let gameIndex = 0
const addGame = () => {
    $("#games").append(`
        <div idx=${gameIndex} class="card game row flex-row justify-content-between align-items-center mb-1 p-0 m-0 pt-2 pb-2">
            <div class="col-3 text-center">
                <input idx=${gameIndex} type="text" class="form-control text-center matchup" placeholder="Matchup">
            </div>
            <div class="col-2 text-center">
                <div class="form-group m-0">
                    <select idx=${gameIndex} class="form-control wl">
                        <option>W</option>
                        <option>L</option>
                    </select>
                </div>
            </div>
            <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                <input idx=${gameIndex} type="text" class="form-control text-center pts" placeholder="PTS">
            </div>
            <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                <input idx=${gameIndex} type="text" class="form-control text-center ast" placeholder="AST">
            </div>
            <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                <input idx=${gameIndex} type="text" class="form-control text-center reb" placeholder="REB">
            </div>
            <div class="col-1 text-center text-muted">
                <button idx=${gameIndex} class="btn btn-danger x-button mr-4 remove-game">✕</button>
            </div>
        </div>
    `)

    $(`.matchup`).on("change paste keydown", function(event) {
        const idx = $(this).attr('idx')
        if ($(event.target).val() !== "") { lowerInputError($(event.target)) }
        if (event.which === 13) { event.preventDefault(); $(`.wl[idx='${idx}']`).focus() }
        if (validateGames()) { hideErrorText($("#error-games")) }
    })

    $(`.wl`).on("change paste keydown", function(event) {
        const idx = $(this).attr('idx')
        if (event.which === 13) { event.preventDefault(); $(`.pts[idx='${idx}']`).focus() }
    })

    $(`.pts`).on("change paste keydown", function(event) {
        const idx = $(this).attr('idx')
        if ($(event.target).val() !== "" && !isNaN($(event.target).val())) { lowerInputError($(event.target)) }
        if (event.which === 13) { event.preventDefault(); $(`.ast[idx='${idx}']`).focus() }
        if (validateGames()) { hideErrorText($("#error-games")) }
    })

    $(`.ast`).on("change paste keydown", function(event) {
        const idx = $(this).attr('idx')
        if ($(event.target).val() !== "" && !isNaN($(event.target).val())) { lowerInputError($(event.target)) }
        if (event.which === 13) { event.preventDefault(); $(`.reb[idx='${idx}']`).focus() }
        if (validateGames()) { hideErrorText($("#error-games")) }
    })

    $(`.reb`).on("change paste keydown", function(event) {
        const idx = $(this).attr('idx')
        if ($(event.target).val() !== "" && !isNaN($(event.target).val())) { lowerInputError($(event.target)) }
        if (event.which === 13) {
            if ($(this).closest('.game').next().find('input.matchup').length) {
                $(this).closest('.game').next().find('input.matchup').focus()
            } else {
                $('#add-game-button').focus()
            }
            event.preventDefault()
        }
        if (validateGames()) { hideErrorText($("#error-games")) }
    })

    $(".remove-game").click(function() {
        removeGame(parseInt($(this).attr('idx')))
    })
    gameIndex++
}

const removeGame = (idx) => {
    $(`.game[idx='${idx}']`).remove()
}

const validateGames = () => {
    let isValid = true
    $(".matchup").each(function () {
        if ($(this).val() === "") { isValid = false }
    })
    if (isValid) {
        $(".pts, .ast, .reb").each(function () {
            if ($(this).val() === "" && !isNaN($(this).val())) { isValid = false }
        })
    }
    return isValid
}

const validateAndGeneratePlayer = () => {

    // Validate that all games are filled
    let areGamesValid = true
    let areGamesNumericallyValid = true
    const games = []
    $(".game").each(function(id) {
        const idx = $(this).attr('idx')
        const matchup = $(`.matchup[idx='${idx}']`)
        const wlText = $(`.wl[idx='${idx}'] option:selected`).text()
        const pts = $(`.pts[idx='${idx}']`)
        const ast = $(`.ast[idx='${idx}']`)
        const reb = $(`.reb[idx='${idx}']`)

        if (reb.val().length === 0) {
            areGamesValid = false
            raiseInputError(reb)
        } else if (isNaN(reb.val())) {
            areGamesNumericallyValid = false
            raiseInputError(reb)
        } else {
            lowerInputError(reb)
        }

        if (ast.val().length === 0) {
            areGamesValid = false
            raiseInputError(ast)
        } else if (isNaN(ast.val())) {
            areGamesNumericallyValid = false
            raiseInputError(ast)
        } else {
            lowerInputError(ast)
        }

        if (pts.val().length === 0) {
            areGamesValid = false
            raiseInputError(pts)
        } else if (isNaN(pts.val())) {
            areGamesNumericallyValid = false
            raiseInputError(pts)
        } else {
            lowerInputError(pts)
        }

        if (matchup.val().length === 0) {
            areGamesValid = false
            raiseInputError(matchup)
        } else {
            lowerInputError(matchup)
        }

        games.push({
            id,
            matchup: matchup.val(),
            result: wlText,
            pts: pts.val(),
            ast: ast.val(),
            reb: reb.val(),
        })
    })
    if (!areGamesNumericallyValid || !areGamesValid) {
        if (!areGamesValid) {
            showErrorText($("#error-games"), "Missing game stats")
        } else {
            showErrorText($("#error-games"), "PTS, AST, and REB must be numbers")
        }
    }
    if (areGamesValid && areGamesNumericallyValid) {
        hideErrorText($("#error-games"))
    }

    // Validate season stats
    let areSeasonStatsValid = true
    const pts = $("#pts"), ast = $("#ast"), reb = $("#reb")
    if (reb.val().length === 0 || isNaN(reb.val())) {
        areSeasonStatsValid = false
        raiseInputError(reb)
    } else {
        lowerInputError(reb)
    }

    if (ast.val().length === 0 || isNaN(ast.val())) {
        areSeasonStatsValid = false
        raiseInputError(ast)
    } else {
        lowerInputError(ast)
    }

    if (pts.val().length === 0 || isNaN(pts.val())) {
        areSeasonStatsValid = false
        raiseInputError(pts)
    } else {
        lowerInputError(pts)
    }
    if (!areSeasonStatsValid) {
        showErrorText($("#error-season"), "PTS, AST, and REB must be non-empty numbers")
    } else {
        hideErrorText($("#error-season"))
    }

    // Validate description
    let isDescriptionValid = true
    if ($("#description-edit-box").val().length === 0) {
        isDescriptionValid = false
        raiseInputError($("#description-edit-box"))
        showErrorText($("#error-description"), "Description must not be empty")
    } else {
        lowerInputError($("#description-edit-box"))
        hideErrorText($("#error-description"))
    }

    // Validate college and country (origin)
    const isCountryValid = $("#country").val().length !== 0
    const isCollegeValid = $("#college").val().length !== 0
    if (!isCollegeValid && !isCountryValid) {
        raiseInputError($("#college"))
        raiseInputError($("#country"))
        showErrorText($("#error-origin"), "Country and college must be provided")
    } else if (!isCountryValid) {
        raiseInputError($("#country"))
        showErrorText($("#error-origin"), "Country must be provided")
    } else if (!isCollegeValid) {
        raiseInputError($("#college"))
        showErrorText($("#error-origin"), "College must be provided")
    } else {
        lowerInputError($("#college"))
        lowerInputError($("#country"))
        hideErrorText($("#error-origin"))
    }

    // Validate team name
    const isTeamValid = $("#team").val().length !== 0
    if (!isTeamValid) {
        raiseInputError($("#team"))
        showErrorText($("#error-details"), "Team name is invalid")
    } else {
        lowerInputError($("#team"))
        hideErrorText($("#error-details"))
    }

    // Validate first and last names
    const isFirstNameValid = $("#firstName").val().length !== 0
    const isLastNameValid = $("#lastName").val().length !== 0
    if (!isFirstNameValid && !isLastNameValid) {
        raiseInputError($("#lastName"))
        raiseInputError($("#firstName"))
        showErrorText($("#error-name"), "First and last names must be provided")
    } else if (!isFirstNameValid) {
        raiseInputError($("#firstName"))
        showErrorText($("#error-name"), "First name must be provided")
    } else if (!isLastNameValid) {
        raiseInputError($("#lastName"))
        showErrorText($("#error-name"), "Last name must be provided")
    } else {
        lowerInputError($("#firstName"))
        lowerInputError($("#lastName"))
        hideErrorText($("#error-name"))
    }

    // Validate image URL
    let isImageURLValid = true
    if ($("#image-url").val().length === 0) {
        isImageURLValid = false
        raiseInputError($("#image-url"))
        showErrorText($("#error-image"), "Image URL must be provided")
    } else if (!($("#image-url").val().match(/\.(jpeg|jpg|gif|png)$/))) {
        isImageURLValid = false
        raiseInputError($("#image-url"))
        showErrorText($("#error-image"), "Image URL is invalid")
    } else {
        lowerInputError($("#team"))
        hideErrorText($("#error-image"))
    }

    if (areGamesValid && areGamesNumericallyValid && areSeasonStatsValid && isDescriptionValid &&
        isCountryValid && isCollegeValid && isTeamValid && isFirstNameValid && isLastNameValid && isImageURLValid) {
            return {
                firstName: $("#firstName").val(),
                lastName: $("#lastName").val(),
                team: $("#team").val(),
                school: $("#college").val(),
                country: $("#country").val(),
                pts: $("#pts").val(),
                ast: $("#ast").val(),
                reb: $("#reb").val(),
                position: $(`#position option:selected`).text(),
                games,
                description: $("#description-edit-box").val(),
                image: $("#image-url").val()
            }
    }

    return null
}

const createPlayer = (player) => {
    $("#create-player-button").html("Creating Player...")
    $("input").prop("disabled", true)
    hideErrorText($("#error-create"))
    $.ajax({
        type: "POST",
        url: "/create_player",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify(player),
        success: (result) => {
            $("input").prop("disabled", false)
            $("#create-player-button").html("Create Player")
            const player = result["player"]
            onCreate(player)
        },
        error: function(request, status, error) {
            $("input").prop("disabled", false)
            $("#create-player-button").html("Create Player")
            showErrorText($("#error-create"), "A server error occurred")
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    })
}

const onCreate = (player) => {
    $("#alert-container").html(`
        <div class="alert alert-success alert-dismissible fade show mb-3 p-2 pr-4 d-flex justify-content-between flex-row align-items-center" role="alert">
            <div class="pl-2">
                <span class="bold">${player.firstName} ${player.lastName}</span> successfully created!
            </div>
            <button class="view-player btn btn-muted mr-4">
                View Player Profile
            </button>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `)
    $(".view-player").click(() => goToView(player.id))
    $(".close").click(() => $("#alert-container").html(''))
    discardChanges()
}

const autoFindImage = (imageString) => {
    const doneText = $("#image-button").html()
    $("#image-button").prop('disabled', true)
    $("#image-button").html("Searching...")
    $.ajax({
        type: "GET",
        url: `/image/${imageString}`,
        success: (result) => {
            let imageUrl = result["image"]
            if (imageUrl) {
                imageUrl = `${imageUrl}?${Date.now()}` // fixes caching bugs
                $("#image-url").val(imageUrl)
                $("#image-container").prop('src', imageUrl)
                hideErrorText($("#error-image"))
            } else {
                showErrorText($("#error-image"), `Could not find an image of ${imageString}`)
            }
            $("#image-button").html(doneText)
            $("#image-button").prop('disabled', false)
            $("#image-button").hide()
            hideErrorText($("#error-image"))
        },
        error: function(request, status, error) {
            showErrorText($("#error-image"), `Could not find an image of ${imageString}`)
            $("#image-button").prop('disabled', false)
            $("#image-button").html(doneText)
            $("#image-button").hide()
        }
    })
}

const discardChanges = () => {
    $("input").prop("disabled", false)
    lowerInputError($("input, textarea"))
    hideErrorText($("[id^=error-]"))
    $("#image-container").prop('src', '')
    $("#games").html('')
    $("#image-button").hide()
    addGame()
    $("input, textarea").val('')
    $("#firstName").focus()
}

$(document).ready(function() {

    addGame()

    // Image input
    $("#image-url").on("change paste keydown", (event) => {
        // On enter press
        if (event.which === 13) {
            event.preventDefault()
            $("#firstName").focus()
        }
        $("#image-container").prop('src', $("#image-url").val())
        hideErrorText($("#error-image"))
        lowerInputError($("#image-url"))
    })

    // First name input
    $("#firstName").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#lastName").focus() }
        if ($("#firstName").val() !== "") { lowerInputError($("#firstName")) }
        if ($("#firstName").val() !== "" && $("#lastName").val() !== "") {
            $("#image-button").show()
            $("#image-button").off('click').click(() => autoFindImage($("#firstName").val() + " " + $("#lastName").val()))
            hideErrorText($("#error-name"))
        } else {
            $("#image-button").hide()
        }
    })

    // Last name input
    $("#lastName").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#position").focus() }
        if ($("#lastName").val() !== "") { lowerInputError($("#lastName")) }
        if ($("#firstName").val() !== "" && $("#lastName").val() !== "") {
            $("#image-button").show()
            $("#image-button").off('click').click(() => autoFindImage($("#firstName").val() + " " + $("#lastName").val()))
            hideErrorText($("#error-name"))
        } else {
            $("#image-button").hide()
        }
    })

    // Position selection
    $("#position").on("change", (event) => {
        $("#team").focus()
    })

    // Team name input
    $("#team").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#country").focus() }
        if ($("#team").val() !== "") {
            lowerInputError($("#team"))
            hideErrorText($("#error-details"))
        }
    })

    // Country input
    $("#country").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#college").focus() }
        if ($("#country").val() !== "") { lowerInputError($("#country")) }
        if ($("#country").val() !== "" && $("#college").val() !== "") { hideErrorText($("#error-origin")) }
    })

    // College input
    $("#college").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#description-edit-box").focus() }
        if ($("#college").val() !== "") { lowerInputError($("#college")) }
        if ($("#country").val() !== "" && $("#college").val() !== "") { hideErrorText($("#error-origin")) }
    })

    // PTS input
    $("#pts").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#ast").focus() }
        if ($("#pts").val() !== "") { lowerInputError($("#pts")) }
        if ($("#pts").val() !== "" && $("#ast").val() !== "" && $("#reb").val() !== "" &&
        !isNaN($("#pts").val()) && !isNaN($("#ast").val()) && !isNaN($("#reb").val())) { hideErrorText($("#error-season")) }
    })

    // AST input
    $("#ast").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#reb").focus() }
        if ($("#ast").val() !== "") { lowerInputError($("#ast")) }
        if ($("#pts").val() !== "" && $("#ast").val() !== "" && $("#reb").val() !== "" &&
        !isNaN($("#pts").val()) && !isNaN($("#ast").val()) && !isNaN($("#reb").val())) { hideErrorText($("#error-season")) }
    })

    // REB input
    $("#reb").on("change paste keydown", (event) => {
        if (event.which === 13) { event.preventDefault(); $("#add-game-button").focus() }
        if ($("#reb").val() !== "") { lowerInputError($("#reb")) }
        if ($("#pts").val() !== "" && $("#ast").val() !== "" && $("#reb").val() !== "" &&
        !isNaN($("#pts").val()) && !isNaN($("#ast").val()) && !isNaN($("#reb").val())) { hideErrorText($("#error-season")) }
    })

    // Description box
    $("#description-edit-box").on("change paste keydown", (event) => {
        if ($("#description-edit-box").val() !== "") {
            lowerInputError($("#description-edit-box"))
            hideErrorText($("#error-description"))
        }
    })

    // Add game button
    $("#add-game-button").click(function() {
        addGame()
        $(".matchup").eq(-1).focus()
    })

    // Hide all error messages at the start
    hideErrorText($("[id^=error-]"))

    // On submitting the form
    $("#create-player-button").click(() => {
        const player = validateAndGeneratePlayer()
        if (player) {
            createPlayer(player)
        }
    })

    // On discard changes
    $("#discard-button").click(discardChanges)

    // Automatically find an image with given name
    $("#image-button").hide()

})