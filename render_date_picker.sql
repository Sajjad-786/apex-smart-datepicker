-- --------------------------------------------------------
-- APEX Smart Datepicker Plugin
-- Render Procedure
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Helper Function: Resolve Date
-- Supports: SYSDATE, SYSDATE+N, SYSDATE-N, DD.MM.YYYY
-- --------------------------------------------------------
FUNCTION resolve_date (
  p_value IN VARCHAR2
) RETURN VARCHAR2 AS
BEGIN
  IF p_value IS NULL OR p_value = '' THEN
    RETURN NULL;
  ELSIF p_value = 'SYSDATE' THEN
    RETURN TO_CHAR(SYSDATE, 'DD.MM.YYYY');
  ELSIF p_value LIKE 'SYSDATE+%' THEN
    RETURN TO_CHAR(SYSDATE + TO_NUMBER(REPLACE(p_value,'SYSDATE+','')), 'DD.MM.YYYY');
  ELSIF p_value LIKE 'SYSDATE-%' THEN
    RETURN TO_CHAR(SYSDATE - TO_NUMBER(REPLACE(p_value,'SYSDATE-','')), 'DD.MM.YYYY');
  ELSE
    RETURN TO_CHAR(TO_DATE(p_value,'DD.MM.YYYY'),'DD.MM.YYYY');
  END IF;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END resolve_date;

-- --------------------------------------------------------
-- Helper Procedure: Render HTML
-- --------------------------------------------------------
PROCEDURE render_html (
  l_item_name   IN VARCHAR2,
  l_value       IN VARCHAR2,
  l_placeholder IN VARCHAR2,
  l_align       IN VARCHAR2,
  l_color       IN VARCHAR2,
  l_min_date    IN VARCHAR2,
  l_max_date    IN VARCHAR2
) AS
BEGIN
  HTP.P('
    <div class="we-datepicker-wrap"
         id="'         || l_item_name || '_WRAP"
         data-color="' || l_color     || '"
         data-min="'   || NVL(l_min_date,'') || '"
         data-max="'   || NVL(l_max_date,'') || '">

      <input type="text"
             id="'             || l_item_name || '"
             name="'           || l_item_name || '"
             class="apex-item-text apex-item-datepicker we-datepicker-input"
             value="'          || APEX_ESCAPE.HTML(l_value)       || '"
             placeholder="'    || APEX_ESCAPE.HTML(l_placeholder) || '"
             style="text-align:' || l_align || ';"
             aria-labelledby="' || l_item_name || '_LABEL"
             autocomplete="off">

      <span class="we-datepicker-icon" id="' || l_item_name || '_ICON">&#128197;</span>
      <div class="we-picker" id="' || l_item_name || '_PICKER"></div>
    </div>
  ');
END render_html;

-- --------------------------------------------------------
-- Main Procedure: Called by APEX
-- --------------------------------------------------------
PROCEDURE RENDER_DATE_PICKER (
  p_item   IN APEX_PLUGIN.T_ITEM,
  p_plugin IN APEX_PLUGIN.T_PLUGIN,
  p_param  IN APEX_PLUGIN.T_ITEM_RENDER_PARAM,
  p_result IN OUT NOCOPY APEX_PLUGIN.T_ITEM_RENDER_RESULT
) AS
  l_item_name   VARCHAR2(100)  := APEX_ESCAPE.HTML_ATTRIBUTE(p_item.name);
  l_value       VARCHAR2(4000) := NVL(p_param.value, '');
  l_placeholder VARCHAR2(4000) := NVL(p_item.placeholder, 'DD.MM.YYYY');
  l_align       VARCHAR2(10)   := NVL(p_item.attribute_01, 'center');
  l_color       VARCHAR2(20)   := NVL(p_item.attribute_02, '#7b1a2e');
  l_min_date    VARCHAR2(20)   := resolve_date(p_item.attribute_03);
  l_max_date    VARCHAR2(20)   := resolve_date(p_item.attribute_04);
BEGIN
  render_html(
    l_item_name,
    l_value,
    l_placeholder,
    l_align,
    l_color,
    l_min_date,
    l_max_date
  );

  APEX_JAVASCRIPT.ADD_ONLOAD_CODE(
    p_code => 'WE_DatePicker.init("' || l_item_name || '");'
  );

  p_result.is_navigable := TRUE;

END RENDER_DATE_PICKER;
