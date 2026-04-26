var WE_DatePicker = (function () {

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return { r: r, g: g, b: b };
  }

  function lighten(hex, amount) {
    var rgb = hexToRgb(hex);
    var r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    var g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    var b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  var lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  var isDE = lang.startsWith("de");

  var i18n = {
    months:     isDE ? ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"]
                     : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    monthsFull: isDE ? ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]
                     : ["January","February","March","April","May","June","July","August","September","October","November","December"],
    days:       isDE ? ["Mo","Di","Mi","Do","Fr","Sa","So"]
                     : ["Mo","Tu","We","Th","Fr","Sa","Su"]
  };

  function parseDate(str) {
    if (!str || str.trim() === '') return null;
    var parts = str.split(".");
    if (parts.length !== 3) return null;
    var d = parseInt(parts[0]);
    var m = parseInt(parts[1]);
    var y = parseInt(parts[2]);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    return new Date(y, m - 1, d);
  }

  function init(itemName) {
    var field  = document.getElementById(itemName);
    var icon   = document.getElementById(itemName + "_ICON");
    var picker = document.getElementById(itemName + "_PICKER");
    var wrap   = document.getElementById(itemName + "_WRAP");
    if (!field || !icon || !picker || !wrap) return;

    // --- Farbe ---
    var color = wrap.getAttribute("data-color") || "#7b1a2e";
    wrap.style.setProperty("--we-color",        color);
    wrap.style.setProperty("--we-color-light",  lighten(color, 0.85));
    wrap.style.setProperty("--we-color-medium", lighten(color, 0.70));

    // --- t-Form-itemWrapper und Input fixen ---
    var itemWrapper    = wrap.closest(".t-Form-itemWrapper");
    var fieldContainer = wrap.closest(".t-Form-fieldContainer");
    var isStretch      = fieldContainer && fieldContainer.classList.contains("t-Form-fieldContainer--stretchInputs");

    if (itemWrapper) {
      itemWrapper.style.display = "block";
      if (isStretch) {
        itemWrapper.style.width = "100%";
      }
    }

    if (isStretch) {
      field.style.width      = "100%";
      field.style.boxSizing  = "border-box";
    }
    field.style.paddingRight = "36px";

    icon.style.position  = "absolute";
    icon.style.right     = "8px";
    icon.style.top       = "50%";
    icon.style.transform = "translateY(-50%)";

    // --- Wrap position sicherstellen ---
    wrap.style.position   = "relative";
    wrap.style.display    = "inline-flex";
    wrap.style.alignItems = "center";
    
    if (isStretch) {
      wrap.style.width = "100%";
    } else {
      wrap.style.width = "auto";
    }
    
    // --- Min / Max ---
    var minDate = parseDate(wrap.getAttribute("data-min"));
    var maxDate = parseDate(wrap.getAttribute("data-max"));

    function isDisabled(y, m, d) {
      if (!minDate && !maxDate) return false;
      var date = new Date(y, m, d);
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    }

    function isMonthDisabled(y, m) {
      if (!minDate && !maxDate) return false;
      var lastDay = new Date(y, m + 1, 0).getDate();
      if (minDate && new Date(y, m, lastDay) < minDate) return true;
      if (maxDate && new Date(y, m, 1)       > maxDate) return true;
      return false;
    }

    function isYearDisabled(y) {
      if (!minDate && !maxDate) return false;
      if (minDate && y < minDate.getFullYear()) return true;
      if (maxDate && y > maxDate.getFullYear()) return true;
      return false;
    }

    var today    = new Date();
    var selDay   = null;
    var selMonth = today.getMonth();
    var selYear  = today.getFullYear();
    var view     = "day";

    // --- Handeingabe ---
    field.addEventListener("input", function () {
      var val    = this.value.replace(/[^0-9]/g, "");
      var result = "";
      if (val.length >= 1) {
        var day = val.substring(0, 2);
        if (day.length === 2 && parseInt(day) > 31) day = "31";
        if (day.length === 2 && parseInt(day) < 1)  day = "01";
        result += day;
      }
      if (val.length >= 3) {
        var month = val.substring(2, 4);
        if (month.length === 2 && parseInt(month) > 12) month = "12";
        if (month.length === 2 && parseInt(month) < 1)  month = "01";
        result += "." + month;
      }
      if (val.length >= 5) {
        result += "." + val.substring(4, 8);
      }
      this.value = result;

      if (result.length === 10) {
        var entered = parseDate(result);
        if (entered) {
          if (minDate && entered < minDate) {
            field.style.borderColor = "#e24b4a";
            field.title = isDE ? "Datum ist zu früh!" : "Date is too early!";
          } else if (maxDate && entered > maxDate) {
            field.style.borderColor = "#e24b4a";
            field.title = isDE ? "Datum ist zu spät!" : "Date is too late!";
          } else {
            field.style.borderColor = "";
            field.title = "";
          }
        }
      } else {
        field.style.borderColor = "";
        field.title = "";
      }
    });

    // --- Render ---
    function render() {
      var html = "";

      html += '<div class="we-picker-header">';
      html += '<button class="we-picker-nav" onclick="WE_DatePicker.prev(\'' + itemName + '\')">&#8249;</button>';
      html += '<div style="display:flex;gap:6px;">';
      html += '<button class="we-nav-btn' + (view === "month" ? " active" : "") + '" onclick="WE_DatePicker.setView(\'' + itemName + '\',\'month\')">' + i18n.monthsFull[selMonth] + '</button>';
      html += '<button class="we-nav-btn' + (view === "year"  ? " active" : "") + '" onclick="WE_DatePicker.setView(\'' + itemName + '\',\'year\')">'  + selYear + '</button>';
      html += '</div>';
      html += '<button class="we-picker-nav" onclick="WE_DatePicker.next(\'' + itemName + '\')">&#8250;</button>';
      html += '</div>';

      if (view === "day") {
        var firstDay    = new Date(selYear, selMonth, 1).getDay();
        var daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;

        html += '<div class="we-picker-grid-7" style="margin-bottom:4px;">';
        i18n.days.forEach(function (d) {
          html += '<div class="we-picker-day-label">' + d + '</div>';
        });
        html += '</div>';
        html += '<div class="we-picker-grid-7">';
        for (var i = 0; i < firstDay; i++) html += '<div></div>';
        for (var d = 1; d <= daysInMonth; d++) {
          var disabled = isDisabled(selYear, selMonth, d);
          var cls = "we-picker-cell";
          if (disabled) {
            cls += " disabled";
          } else if (d === selDay) {
            cls += " selected";
          } else if (d === today.getDate() && selMonth === today.getMonth() && selYear === today.getFullYear()) {
            cls += " today";
          }
          var onclick = disabled ? "" : 'onclick="WE_DatePicker.selectDay(\'' + itemName + '\',' + d + ')"';
          html += '<div class="' + cls + '" ' + onclick + '>' + d + '</div>';
        }
        html += '</div>';
      }

      if (view === "month") {
        html += '<div class="we-picker-grid-3">';
        i18n.months.forEach(function (m, i) {
          var disabled = isMonthDisabled(selYear, i);
          var cls = "we-picker-month-cell" + (i === selMonth ? " selected" : "") + (disabled ? " disabled" : "");
          var onclick = disabled ? "" : 'onclick="WE_DatePicker.selectMonth(\'' + itemName + '\',' + i + ')"';
          html += '<div class="' + cls + '" ' + onclick + '>' + m + '</div>';
        });
        html += '</div>';
      }

      if (view === "year") {
        var currentYear = today.getFullYear();
        var startYear   = selYear - 6;
        html += '<div class="we-picker-grid-3">';
        for (var y = startYear; y <= startYear + 11; y++) {
          if (y > currentYear) break;
          var disabled = isYearDisabled(y);
          var cls = "we-picker-month-cell" + (y === selYear ? " selected" : "") + (disabled ? " disabled" : "");
          var onclick = disabled ? "" : 'onclick="WE_DatePicker.selectYear(\'' + itemName + '\',' + y + ')"';
          html += '<div class="' + cls + '" ' + onclick + '>' + y + '</div>';
        }
        html += '</div>';
      }

      picker.innerHTML = html;
    }

    // --- Store instance ---
    WE_DatePicker._instances[itemName] = {
      field: field, picker: picker,
      getView:     function()  { return view; },
      setView:     function(v) { view = v; render(); },
      prev: function() {
        if (view === "day")   { selMonth--; if (selMonth < 0)  { selMonth = 11; selYear--; } }
        if (view === "month") { selYear--; }
        if (view === "year")  { selYear -= 12; }
        render();
      },
      next: function() {
        if (view === "day")   { selMonth++; if (selMonth > 11) { selMonth = 0; selYear++; } }
        if (view === "month") { selYear++; }
        if (view === "year")  { if (selYear + 12 <= today.getFullYear()) selYear += 12; }
        render();
      },
      selectDay: function(d) {
        selDay = d;
        var mm = String(selMonth + 1).padStart(2, "0");
        var dd = String(d).padStart(2, "0");
        field.value = dd + "." + mm + "." + selYear;
        apex.item(itemName).setValue(field.value);
        picker.style.display = "none";
      },
      selectMonth: function(m) { selMonth = m; view = "day";   render(); },
      selectYear:  function(y) { selYear  = y; view = "month"; render(); }
    };

    // --- Icon click ---
    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = picker.style.display === "block";
      if (!isOpen) {
        picker.style.display = "block";
        picker.style.width   = field.offsetWidth + "px";
        render();
      } else {
        picker.style.display = "none";
      }
    });

    wrap.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    window.addEventListener("resize", function () {
      if (picker.style.display === "block") {
        picker.style.width = field.offsetWidth + "px";
      }
    });

    document.addEventListener("click", function () {
      picker.style.display = "none";
    });

    picker.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  return {
    _instances: {},
    init:        function(n)    { init(n); },
    setView:     function(n, v) { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].setView(v); },
    prev:        function(n)    { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].prev(); },
    next:        function(n)    { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].next(); },
    selectDay:   function(n, d) { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].selectDay(d); },
    selectMonth: function(n, m) { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].selectMonth(m); },
    selectYear:  function(n, y) { if (WE_DatePicker._instances[n]) WE_DatePicker._instances[n].selectYear(y); }
  };

})();
