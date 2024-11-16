 /* Running text in top navbar - Text box marquee            */
speed_Scrolling = 150
characters_Scroll = 1

function scrolling_Text() {
    window.setTimeout('scrolling_Text()', speed_Scrolling);

    var msg = document.text_Marquee.text.value;
    document.text_Marquee.text.value =
        msg.substring(characters_Scroll) +
        msg.substring(0, characters_Scroll);
}
scrolling_Text()
