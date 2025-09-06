// VS Code Theme Variables - Industry Standard Colors
export const VSCodeTheme = {
  // Background Colors
  sidebarBackground: '#252526',
  editorBackground: '#1e1e1e',
  activityBarBackground: '#333333',
  statusBarBackground: '#007acc',
  titleBarBackground: '#3c3c3c',
  
  // Panel Colors
  panelBackground: '#252526',
  panelBorder: '#2d2d30',
  
  // Text Colors
  foreground: '#cccccc',
  secondaryForeground: '#969696',
  disabledForeground: '#656565',
  
  // Interactive Elements
  buttonBackground: '#0e639c',
  buttonHoverBackground: '#1177bb',
  inputBackground: '#3c3c3c',
  inputBorder: '#464647',
  
  // File Explorer
  explorerBackground: '#252526',
  explorerHover: '#2a2d2e',
  explorerSelection: '#094771',
  explorerFocus: '#0e639c',
  
  // Editor
  editorLineNumber: '#858585',
  editorSelection: '#264f78',
  editorFindMatch: '#515c6a',
  
  // Chat Colors
  chatBackground: '#1e1e1e',
  chatBubbleUser: '#0e639c',
  chatBubbleAssistant: '#2d2d30',
  chatBorder: '#464647',
  
  // Syntax Highlighting
  syntaxKeyword: '#569cd6',
  syntaxString: '#ce9178',
  syntaxComment: '#6a9955',
  syntaxNumber: '#b5cea8',
  syntaxFunction: '#dcdcaa',
  syntaxVariable: '#9cdcfe',
  syntaxOperator: '#d4d4d4',
  
  // Status Colors
  errorForeground: '#f48771',
  warningForeground: '#ffcc02',
  infoForeground: '#75beff',
  successForeground: '#89d185',
  
  // Shadows and Borders
  shadow: 'rgba(0, 0, 0, 0.36)',
  focusBorder: '#007fd4',
  border: '#2d2d30',
  
  // Scrollbar
  scrollbarSlider: '#79797966',
  scrollbarSliderHover: '#646464b3',
  scrollbarSliderActive: '#bfbfbf66',
  
  // Minimap
  minimapBackground: '#2d2d30',
  minimapSlider: '#79797966',
  
  // Breadcrumb
  breadcrumbBackground: '#252526',
  breadcrumbForeground: '#cccccc',
  breadcrumbFocusForeground: '#e7e7e7',
  
  // Tab Colors
  tabActiveBackground: '#1e1e1e',
  tabInactiveBackground: '#2d2d30',
  tabActiveForeground: '#ffffff',
  tabInactiveForeground: '#969696',
  tabBorder: '#252526',
  tabActiveBorder: '#007acc',
  
  // Activity Bar
  activityBarForeground: '#ffffff',
  activityBarInactiveForeground: '#969696',
  activityBarBadgeBackground: '#007acc',
  activityBarBadgeForeground: '#ffffff',
};

// Light Theme Variant
export const VSCodeLightTheme = {
  // Background Colors
  sidebarBackground: '#f3f3f3',
  editorBackground: '#ffffff',
  activityBarBackground: '#2c2c2c',
  statusBarBackground: '#007acc',
  titleBarBackground: '#dddddd',
  
  // Panel Colors
  panelBackground: '#f3f3f3',
  panelBorder: '#e7e7e9',
  
  // Text Colors
  foreground: '#383a42',
  secondaryForeground: '#696c77',
  disabledForeground: '#a0a1a7',
  
  // Interactive Elements
  buttonBackground: '#007acc',
  buttonHoverBackground: '#005a9e',
  inputBackground: '#ffffff',
  inputBorder: '#cecece',
  
  // File Explorer
  explorerBackground: '#f3f3f3',
  explorerHover: '#e8e8e8',
  explorerSelection: '#e4e6f1',
  explorerFocus: '#0066cc',
  
  // Editor
  editorLineNumber: '#237893',
  editorSelection: '#add6ff',
  editorFindMatch: '#a8ac94',
  
  // Chat Colors
  chatBackground: '#ffffff',
  chatBubbleUser: '#007acc',
  chatBubbleAssistant: '#f3f3f3',
  chatBorder: '#e7e7e9',
  
  // Syntax Highlighting (adjusted for light theme)
  syntaxKeyword: '#0000ff',
  syntaxString: '#a31515',
  syntaxComment: '#008000',
  syntaxNumber: '#098658',
  syntaxFunction: '#795e26',
  syntaxVariable: '#001080',
  syntaxOperator: '#000000',
  
  // Status Colors
  errorForeground: '#e51400',
  warningForeground: '#bf8803',
  infoForeground: '#1a85ff',
  successForeground: '#388a34',
  
  // Shadows and Borders
  shadow: 'rgba(0, 0, 0, 0.16)',
  focusBorder: '#0066cc',
  border: '#e7e7e9',
  
  // Rest similar to dark theme but adjusted...
  scrollbarSlider: '#64646466',
  scrollbarSliderHover: '#646464b3',
  scrollbarSliderActive: '#00000066',
  
  minimapBackground: '#f3f3f3',
  minimapSlider: '#64646466',
  
  breadcrumbBackground: '#f3f3f3',
  breadcrumbForeground: '#383a42',
  breadcrumbFocusForeground: '#005a9e',
  
  tabActiveBackground: '#ffffff',
  tabInactiveBackground: '#ececec',
  tabActiveForeground: '#383a42',
  tabInactiveForeground: '#696c77',
  tabBorder: '#f3f3f3',
  tabActiveBorder: '#005a9e',
  
  activityBarForeground: '#ffffff',
  activityBarInactiveForeground: '#969696',
  activityBarBadgeBackground: '#007acc',
  activityBarBadgeForeground: '#ffffff',
};

// Helper function to get current theme
export const getCurrentTheme = (isDark: boolean = true) => {
  return isDark ? VSCodeTheme : VSCodeLightTheme;
};

// Common measurements and spacing
export const VSCodeLayout = {
  activityBarWidth: 48,
  sidebarMinWidth: 170,
  sidebarDefaultWidth: 300,
  sidebarMaxWidth: 800,
  panelMinHeight: 100,
  panelDefaultHeight: 300,
  titleBarHeight: 30,
  statusBarHeight: 22,
  tabHeight: 35,
  
  // Border radius
  borderRadius: 3,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 16,
  },
  
  // Animation durations
  transition: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },
};
