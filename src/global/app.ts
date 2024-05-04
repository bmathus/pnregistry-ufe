import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';
import '@material/web/tabs/secondary-tab';
import '@material/web/tabs/tabs';
import '@material/web/divider/divider';
import '@material/web/chips/filter-chip';
import '@material/web/button/filled-tonal-button';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/select/outlined-select';
import '@material/web/select/select-option';
import '@material/web/checkbox/checkbox';
import '@material/web/dialog/dialog';
import '@material/web/progress/linear-progress';

import { registerNavigationApi } from './navigation.js';

export default function () {
  // or export default async function()
  // package initialization code
  registerNavigationApi();
}
