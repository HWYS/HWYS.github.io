// Menu Toggle Script

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$('#menu-toggle').on('click', function(){
    var spanSelector = $(this).find('span:first');
    if(spanSelector.hasClass('ico-menu')) {
        spanSelector.removeClass('ico-menu')
        spanSelector.addClass('ico-x')
    } else if (spanSelector.hasClass('ico-x')) {
    spanSelector.removeClass('ico-x')
    spanSelector.addClass('ico-menu')
}
});

$("#menu-toggle-mobile").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$('#menu-toggle-mobile').on('click', function(){
    var spanSelector = $(this).find('span:first');
    if(spanSelector.hasClass('ico-menu')) {
        spanSelector.removeClass('ico-menu')
        spanSelector.addClass('ico-x')
    } else if (spanSelector.hasClass('ico-x')) {
    spanSelector.removeClass('ico-x')
    spanSelector.addClass('ico-menu')
}
});