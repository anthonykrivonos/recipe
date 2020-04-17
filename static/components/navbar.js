
$(document).ready(function(){
    $("#search-button").click(function() {
        const searchText = $("#search-input").val()
        goToSearch(searchText)
    })

    $("#create-button").click(() => window.location = '/create')

    $("#search-input").on("change paste keyup keydown", (event) => {
        // On enter press
        if (event.which === 13) {
            event.preventDefault()
            const searchText = $("#search-input").val()
            goToSearch(searchText)
        }
    })

    const searchQuery = getQueryParam('search')
    if (searchQuery) {
        $("#search-input").val(searchQuery)
    }

    getAutocompleteNames((names) => {
        $("#search-input").autocomplete({
            source: names
        });
    })
})