import sceneChrome from './templates/scene-chrome.html?raw';
import cockpit from './templates/cockpit.html?raw';
import displayControls from './templates/display-controls.html?raw';
import commandDock from './templates/command-dock.html?raw';
import layerPanels from './templates/layer-panels.html?raw';
import context from './templates/context.html?raw';
import welcome from './templates/welcome.html?raw';
import providerSettings from './templates/provider-settings.html?raw';
import hudLoading from './templates/hud-loading.html?raw';

export const GODS_EYE_TEMPLATES_MARKUP = [
  sceneChrome,
  cockpit,
  displayControls,
  commandDock,
  layerPanels,
  context,
  welcome,
  providerSettings,
  hudLoading,
].join('\n');
