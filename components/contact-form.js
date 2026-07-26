(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.elements.namedItem("name").value.trim();
    var email = form.elements.namedItem("email").value.trim();
    var subject = form.elements.namedItem("subject").value.trim();
    var message = form.elements.namedItem("message").value.trim();

    var body = [
      "Name: " + name,
      "Email: " + email,
      "",
      message,
    ].join("\r\n");

    var mailto =
      "mailto:saketh.cih@gmail.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailto;
  });
})();
