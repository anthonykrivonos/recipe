const displayPlayer = (player) => {
    if (!player) {
        $("#player").html(`
            <div class="d-flex justify-content-center">
                <div class="h4 pt-4 pb-4 text-muted">Could not find this player... 😤 <a href="/create">Create him?</a></div>
            </div>
        `)
        return
    }
    let idx = 0
    $("#games").html(player.games.map((game) => !game.mark_as_deleted ? (
        `
        <div game-id="${game.id}" class="game-container" game-id="${game.id}">
            <div class="game card row flex-row justify-content-between align-items-center mb-1 p-0 m-0">
                <div class="col-1 text-muted">${++idx}</div>
                <div class="col-3 text-center">
                    ${game.matchup}
                </div>
                <div class="col-1 ${game.result === 'W' ? 'bold' : ''} text-center">
                    ${game.result}
                </div>
                <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                    <div class="bold text-dark">PTS</div>
                    <div>${game.pts}</div>
                </div>
                <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                    <div class="bold text-dark">AST</div>
                    <div>${game.ast}</div>
                </div>
                <div class="col-2 d-flex flex-column align-items-center justify-content-center">
                    <div class="bold text-dark">REB</div>
                    <div>${game.reb}</div>
                </div>
                <div class="col-1 d-flex flex-column align-items-center justify-content-center">
                    <button game-id="${game.id}" class="delete-button p-0 m-0 text-primary">
                        <img width="18" height="18" src="/static/assets/delete.svg" alt="Delete" />    
                    </button>
                </div>
            </div>
            <div class="deleted-game">
                <div class="d-flex justify-content-between align-items-center mb-2 mt-2">
                    <div>Deleted <span class="bold">${game.matchup}</span>.</div>
                    <button class="recover-button btn btn-muted text-danger p-0 m-0">
                        Undo delete?
                    </button>
                </div>
            </div>
        </div>
        `
    ) : '').join(' '))
    $(".deleted-game").hide()
    $(".delete-button").click(function() {
        const gameId = parseInt($(this).attr('game-id'))
        deleteGame(player.id, gameId, true, () => {
            const gameContainer = $(`.game-container[game-id=${gameId}]`)
            gameContainer.find("div.deleted-game").show()
            gameContainer.find("div.game").hide()
            gameContainer.find(".recover-button").click(() => {
                deleteGame(player.id, gameId, false)
                gameContainer.find("div.deleted-game").hide()
                gameContainer.find("div.game").show()
            })
        })
    })

}

$(document).ready(function() {

    displayPlayer(player)

    // Hide all inputs
    $("div[id^=edit-group-]").hide()
    $("#edit-description").hide()

    $(".team-text").click(function () {
        const teamName = $(this).attr('team-name')
        const teamQuery = 'team:' + teamName
        goToSearch(teamQuery)
    })
    $(".position").click(function () {
        const positionName = $(this).attr('position')
        const positionQuery = 'position:' + positionName
        goToSearch(positionQuery)
    })

    $("#team-name").css("color", teamColorCode(player.team))

    /**
     * Editing Description
     */

    $("#edit-description-button").click(() => {
        $("#edit-description").show()
        $("#edit-description-box").focus()
        $("#box-description").hide()
    })

    $("#description-discard-changes-button").click(() => {
        $("#edit-description-box").val(player.description)
        $("#edit-description").hide()
        $("#box-description").show()
        lowerInputError($("#edit-description-box"))
    })

    $("#description-done-button").click(() => {
        const description = $("#edit-description-box").val()
        if (description === player.description) {
            raiseInputError($("#edit-description-box"))
            showErrorText($("#edit-description-error"), "Description has not been changed")
        } else if (description === '') {
            raiseInputError($("#edit-description-box"))
            showErrorText($("#edit-description-error"), "Description cannot be empty")
        } else {
            update(player.id, 'description', description, newPlayer => {
                player = newPlayer
                $("#description").html(description)
                lowerInputError($("#edit-description-box"))
                showErrorText($("#edit-description-error"), "") // Hacky ;) - for justification of content
                $("#edit-description").hide()
                $("#box-description").show()
            }, () => {
                showErrorText($("#edit-description-error"), "Something went wrong... Try again?")
            })
        }
    })

    /**
     * Editing PTS, AST, REB
     */

    for (const stat of [ 'pts', 'ast', 'reb' ]) {
        $(`#edit-${stat}-button`).click(() => {
            $(`#${stat}`).hide()
            $(`#edit-${stat}`).val(player[stat])
            $(`#edit-group-${stat}`).show()
            $(`#edit-${stat}`).focus()
            $(`#edit-${stat}-button`).hide()
        })
    
        $(`#${stat}-discard-changes-button`).click(() => {
            $(`#${stat}`).show()
            $(`#${stat}`).html(player[stat])
            $(`#edit-group-${stat}`).hide()
            $(`#edit-${stat}-button`).show()
            lowerInputError($(`#edit-${stat}`))
        })
    
        $(`#${stat}-done-button`).click(() => {
            const val = $(`#edit-${stat}`).val()
            if (val == player[stat]) {
                raiseInputError($(`#edit-${stat}`))
            } else if (val == '') {
                raiseInputError($(`#edit-${stat}`))
            } else if (isNaN(val)) {
                raiseInputError($(`#edit-${stat}`))
            } else {
                update(player.id, stat, parseFloat(val), newPlayer => {
                    player = newPlayer
                    lowerInputError($(`#edit-${stat}`))
                    $(`#${stat}`).html(player[stat])
                    $(`#${stat}`).show()
                    $(`#edit-group-${stat}`).hide()
                    $(`#edit-${stat}-button`).show()
                })
            }
        })
    }

})