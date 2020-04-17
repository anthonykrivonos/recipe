const searchString = getQueryParam('search')

const viewPlayer = (id) => {
    location.href = `/view/${id}`;
}

const createPlayer = () => {
    location.href = `/create`;
}

// Returns an HTML string with the text highlighted if the condition is true
const highlight = (condition, text) => {
    return condition ? `<span class="highlighted">${text}</span>` : text
}

const displayPlayers = (players) => {
    if (players.length == 0) {
        $("#players").html(`
            <div class="d-flex justify-content-center">
                <div class="h4 pt-4 pb-4 text-muted">No results found! 🤧</div>
            </div>
        `)
        return
    }
    const doHighlight = (text) => highlight(
        searchString !== '' && (
        searchString.toLowerCase().includes(text.toLowerCase()) ||
        text.toLowerCase().includes(searchString.toLowerCase()))
    , text)
    $("#players").html(players.map((player) => (
        `
        <div player-id="${player.id}" class="player card pl-1 pr-1 pt-3 pb-3 mb-3">
            <div class="d-flex align-items-top">
                <a alt="${player.firstName} ${player.lastName}" class="ml-3 mr-3" href="/view/${player.id}">
                    <img class="player-img avatar" src="${player.image}" alt="${player.firstName} ${player.lastName}" />
                </a>
                <div class="row full-width p-2">
                    <div class="col-8">
                        <a href="/view/${player.id}" class="name-text bold full-width">${doHighlight(player.firstName)} ${doHighlight(player.lastName)}</a>
                        <div class="text-muted text-uppercase"><a team-name="${player.team}" style="color: ${teamColorCode(player.team)}" class="bold team-text" href="javascript:void(0);">${doHighlight(player.team)}</a> - <a position="${player.position}" class="position text-muted" href="javascript:void(0);">${doHighlight(player.position)}</a></div>
                    </div>
                    <div class="pr-4 d-flex col-4 justify-content-end align-items-center">
                        <button player-id="${player.id}" class="btn btn-info info-button">⛹️‍♂️ More</button>
                    </div>
                    <div class="row pr-0 col-12 pl-4">
                        <div class="p-2 text-center col-4">
                            <div class="card">
                                <div class="bold text-dark">PTS</div>
                                <div>${player.pts}</div>
                            </div>
                        </div>
                        <div class="p-2 text-center col-4">
                            <div class="card">
                                <div class="bold text-dark">AST</div>
                                <div>${player.ast}</div>
                            </div>
                        </div>
                        <div class="p-2 text-center col-4">
                            <div class="card">
                                <div class="bold text-dark">REB</div>
                                <div>${player.reb}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    )))
    $(".info-button").click(function () {
        viewPlayer(parseInt($(this).attr('player-id')))
    })
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
}

$(document).ready(function(){

    displayPlayers(playerData)
    $("#results").html(`${playerData.length} result${playerData.length !== 1 ? 's' : ''}`)

    if (splashImage !== 'None') {
        $("#splash-logo").prop("src", splashImage)
    }

})