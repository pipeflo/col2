$(function () {
	$(".content").click(function () {

		var value = $(this).find(".number").text();

		if (value !== "<") {
			$(".numberinput").each(function () {
				var a = $(this).text();
				if (!a) {
					$(this).text(value);
					$(this).addClass("nocircle");
					return false;
				}
			});
		} else {
			$($(".numberinput").get().reverse()).each(function () {
				var a = $(this).text();
				if (a) {
					$(this).text("");
					$(this).removeClass("nocircle");
					return false;
				}
			});
		}
	});
});
