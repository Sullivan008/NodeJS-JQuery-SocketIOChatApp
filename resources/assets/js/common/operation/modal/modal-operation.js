var modal = {
    warningModal: function (response, width) {
        var bodyContent =
            "<div>" +
            "<h5>Information about that reason: </h5>" +
            "<p>" + response.Details + "</p>" +
            "</div>";

        $(".modal-title").html("[Status Code: " + response.StatusCode + "] - " + response.Reason);
        $(".modal-body").html(bodyContent);

        if (width !== null && width !== undefined) {
            $('.modal-content').css('width', width + 'px');
        }

        $("#warningModal").modal('show');
    }
}