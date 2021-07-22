<template>
<v-app v-gamepad:button-a="BtnA" v-gamepad:button-b="BtnB" v-gamepad:button-x="BtnX"
    v-gamepad:left-analog-right="MvRight" v-gamepad:button-dpad-right="MvRight" v-gamepad:right-analog-right="MvRight"
    v-gamepad:left-analog-left="MvLeft" v-gamepad:button-dpad-left="MvLeft" v-gamepad:right-analog-left="MvLeft"
    v-gamepad:left-analog-up="MvUp" v-gamepad:button-dpad-up="MvUp" v-gamepad:right-analog-up="MvUp"
    v-gamepad:left-analog-down="MvDown" v-gamepad:button-dpad-down="MvDown" v-gamepad:right-analog-down="MvDown">
    <v-app-bar app color="primary">
        <v-btn to="/" text :class="MenuSel(-1)">
            <v-icon>mdi-arrow-left-circle</v-icon>
            <span class="ml-2">{{$t("configBack")}}</span>
        </v-btn>
        <v-spacer />
        <div class="d-flex align-center text-h5">{{$t("configTopSettings")}}</div>
        <v-spacer />
    </v-app-bar>
    <v-main>
        <v-row>
            <v-col cols="2">
                <v-list>
                    <v-list-item-group v-model="selected" mandatory>
                        <v-list-item :ref="'menu' + i" v-for="(s, i) in settings" :key="i" :class="MenuSel(i)">
                            <v-list-item-icon>
                                <v-icon v-text="s.icon" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title v-text="$t('settingsSide' + s.name)" />
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-col>
            <v-col cols="10" class="mt-2">
                <v-card v-if="selected===0" class="mr-5">
                    <v-card-title>{{$t("configApplicationConfig")}}</v-card-title>
                    <v-card-text v-if="configInfo">
                        <v-row>
                            <v-col>
                                <v-card color="secondary">
                                    <v-card-title>{{$t("configBasicSetup")}}</v-card-title>
                                    <v-card-text>
                                        <v-row>
                                            <v-col>
                                                <div class="no-wrap">
                                                    <v-text-field ref="regioninput" :class="'d-inline-block ' + ItemSel('Configuration', 0)" @change="UpdateConfig" :label="$t('preferredRomRegion')" v-model="configInfo.primaryRegion" />
                                                    <BeeTooltip :tooltip="$t('preferredRomRegionDesc')">
                                                        <v-icon small>mdi-information</v-icon>
                                                    </BeeTooltip>
                                                </div>
                                                <v-row>
                                                    <v-col cols="4">
                                                        <v-switch :class="ItemSel('Configuration', 1)" v-model="configInfo.fullscreen" @change="UpdateConfig" :label="$t('configFullScreen')" />
                                                    </v-col>
                                                    <v-col cols="8">
                                                        <v-switch :class="ItemSel('Configuration', 2)" v-model="configInfo.showChrome" :disabled="configInfo.fullscreen" @change="UpdateConfig" :label="$t('configChrome')" />
                                                    </v-col>
                                                </v-row>
                                                <div v-if="showChromeInfoText">{{$t("configChromeInfo")}}</div>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                                <v-card color="secondary">
                                    <v-card-title>{{$t("configDisplayStyle")}}</v-card-title>
                                    <v-card-text>
                                        <v-row>
                                            <v-col>
                                                <v-select :class="ItemSel('Configuration', 6)" :items="displayStyles" v-model="configInfo.viewType" item-text="title" item-value="key" :label="$t('configDisplayStyle')" @change="UpdateConfig" />
                                            </v-col>
                                            <v-col>
                                                <v-text-field :class="ItemSel('Configuration', 7)" v-if="configInfo.viewType === 'tile'" v-model="configInfo.tilesPerRow" :label="$t('configDisplayTilesPerRow')" type="number" @change="UpdateConfig" />
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                            <v-col>
                                <v-card color="secondary">
                                    <v-card-title>{{$t("boxArtApiHeading")}}</v-card-title>
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="4">
                                                <v-switch :class="ItemSel('Configuration', 3)" v-model="configInfo.useGiantBombAPI" @change="UpdateConfig" :label="$t('boxArtApiUseToggle')" />
                                            </v-col>
                                            <v-col cols="8">
                                                <v-text-field ref="apiinput" :class="ItemSel('Configuration', 4)" @change="UpdateConfig" :label="$t('boxArtApiKeyEntry')" :disabled="!configInfo.useGiantBombAPI" v-model="configInfo.giantBombAPIKey" />
                                            </v-col>
                                        </v-row>
                                        <p>
                                            <i18n path="boxArtApiDesc">
                                                <a href="#" @click="OpenImagesFolder" class="no-wrap">images <v-icon x-small color="primary">mdi-open-in-app</v-icon></a>
                                                <code>{{$t("boxArtApiDescConsoleShortCode")}}</code>
                                                <code>{{$t("boxArtApiDescConsoleGameName")}}</code>
                                                <a href="#" @click="OpenAPIInfoURL" class="no-wrap">Giant Bomb API <v-icon x-small color="primary">mdi-open-in-new</v-icon></a>
                                            </i18n>
                                        </p>
                                        <v-row v-if="configInfo.useGiantBombAPI && configInfo.giantBombAPIKey">
                                            <v-col>
                                                <v-btn color="primary" :class="ItemSel('Configuration', 5)" @click="TestGiantBombAPI">{{$t("boxArtApiTestButton")}}</v-btn>
                                            </v-col>
                                            <v-col class="text-center">
                                                <v-progress-circular v-if="apiTestLoading" indeterminate :size="50" color="primary" :width="4" />
                                                <v-img v-if="apiResult" :src="apiResult" contain />
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===1" class="mr-5">
                    <v-card-title>{{$t("eConfig")}}</v-card-title>
                    <v-card-text>
                        <div class="text-right mb-2">
                            <v-btn color="primary" @click="$refs.emuimport.click()">{{$t("eImport")}}</v-btn>
                            <input ref="emuimport" class="d-none" type="file" @change="EmulatorSelect" />
                        </div>
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th>{{$t("eName")}}</th>
                                        <th>{{$t("ePath")}}</th>
                                        <th>
                                            {{$t("eArgs")}}
                                            <BeeTooltip :bottom="true" :tooltip="$t('eArgsTooltip')">
                                                <v-icon class="vert-top" small>mdi-information</v-icon>
                                            </BeeTooltip>
                                        </th>
                                        <th>{{$t("eConsoles")}}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(e, i) in emulators" :key="e.name">
                                        <td>{{e.name}}</td>
                                        <td class="no-wrap">
                                            {{ShortPath(e.path)}}
                                            <BeeTooltip :tooltip="$t('eOpenDirectory')">
                                                <v-btn icon small color="primary" @click="OpenFolderToFile(e.path)"><v-icon small>mdi-open-in-app</v-icon></v-btn>
                                            </BeeTooltip>
                                        </td>
                                        <td><v-combobox v-model="e.args" @change="UpdateEmulators" class="pt-1" small-chips deletable-chips multiple dense append-icon="" /></td>
                                        <td>
                                            <v-autocomplete v-model="e.consoles" :items="consoles" item-text="name" item-value="shortCode" @change="UpdateEmulators"
                                                class="pt-1" small-chips deletable-chips multiple dense :no-data-text="$t('eConsoleNotFound')"  />
                                        </td>
                                        <td>
                                            <BeeTooltip :tooltip="$t('eRemoveMapping')">
                                                <v-btn icon color="error" @click="DeleteEmulator(i)"><v-icon>mdi-delete</v-icon></v-btn>
                                            </BeeTooltip>
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===2" class="mr-5">
                    <v-card-title>{{$t("cConsoleConfig")}}</v-card-title>
                    <v-card-text>
                        <div class="text-right mb-2">
                            <v-text-field ref="search" :class="'d-inline-block searchbox ' + ItemSel('Consoles', -1)" :label="$t('consoleSettingsSearch')" v-model="consoleSearch" prepend-inner-icon="mdi-magnify" clearable />
                        </div>
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th>{{$t("cCode")}}</th>
                                        <th>{{$t("cName")}}</th>
                                        <th>{{$t("cROMPath")}}</th>
                                        <th>{{$t("cImage")}}</th>
                                        <th>{{$t("cExtensions")}}</th>
                                        <th>{{$t("cPreferredEmulator")}}</th>
                                        <th>{{$t("cFavorite")}}</th>
                                        <th>{{$t("cHideUnfavorited")}}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(c, i) in FilteredConsoles" :key="c.shortCode" ref="console">
                                        <td>{{c.shortCode}}</td>
                                        <td>{{c.name}}</td>
                                        <td class="no-wrap">
                                            <div v-if="consolePathEditIdx !== i">
                                                <span v-if="!c.path" class="font-italic">{{$t("cNoneProvided")}}</span>
                                                {{ShortPath(c.path)}}
                                                <BeeTooltip :tooltip="$t('cBrowseDirectory')">
                                                    <v-btn class="vert-mid ml-2" icon x-small color="primary" @click="ROMFolderSelectClick(c.shortCode)"><v-icon>mdi-folder-search</v-icon></v-btn>
                                                    <input :ref="'romFolder' + c.shortCode" class="d-none" type="file" @change="UploadROMFolder(c, $event)" webkitdirectory />
                                                </BeeTooltip>
                                                <BeeTooltip :tooltip="$t('cTypeDirectory')">
                                                    <v-btn class="vert-mid" icon x-small color="primary" @click="SelectROMInput(i)"><v-icon>mdi-folder-edit</v-icon></v-btn>
                                                </BeeTooltip>
                                                <BeeTooltip :tooltip="$t('cOpenDirectory')" v-if="c.path">
                                                    <v-btn class="vert-mid" icon x-small color="primary" @click="OpenFolderToFile(c.path)"><v-icon>mdi-open-in-app</v-icon></v-btn>
                                                </BeeTooltip>
                                            </div>
                                            <div v-else>
                                                <v-text-field v-model="consolePathEditDefault" :ref="'romPath' + i" @keyup.enter="ConfirmROMInputChanges()"
                                                    :label="$t('cROMPath')" class="d-inline-block" :placeholder="$t('cROMPathPrompt')" />
                                                <BeeTooltip :tooltip="$t('cSavePath')">
                                                    <v-btn class="vert-mid ml-1" icon small color="success" @click="ConfirmROMInputChanges()"><v-icon>mdi-checkbox-marked</v-icon></v-btn>
                                                </BeeTooltip>
                                                <BeeTooltip :tooltip="$t('cCancelEdit')">
                                                    <v-btn class="vert-mid" icon small color="error" @click="CancelROMInputChanges()"><v-icon>mdi-close-box</v-icon></v-btn>
                                                </BeeTooltip>
                                            </div>
                                        </td>
                                        <td class="no-wrap">
                                            <v-img class="d-inline-block vert-mid" v-if="c.image" max-width="100" :src="c.image" />
                                            <v-img class="d-inline-block vert-mid" v-if="!c.image && c.default" max-width="100" :src="require(`@/assets/img/${c.shortCode}.png`)" />
                                            <v-img class="d-inline-block vert-mid" v-if="!c.image && !c.default" max-width="100" src="@/assets/notavailable.png" />
                                            <BeeTooltip :tooltip="$t('cBrowseImage')">
                                                <v-btn class="vert-mid ml-2" icon x-small color="primary" @click="ImgUploadClick(c.shortCode)"><v-icon>mdi-file-upload</v-icon></v-btn>
                                                <input :ref="'imgUpload' + c.shortCode" class="d-none" type="file" accept="image/*" @change="UploadImage(c, $event)" />
                                            </BeeTooltip>
                                        </td>
                                        <td><v-combobox v-model="c.extensions" @change="UpdateConsoles" class="pt-3" small-chips deletable-chips multiple dense append-icon="" /></td>
                                        <td>
                                            <v-select v-if="emulatorsForConsole[c.shortCode]" v-model="c.preferredEmulator" :items="emulatorsForConsole[c.shortCode]" @change="UpdateConsoles" />
                                            <em v-else>No available emulators for this console.</em>
                                        </td>
                                        <td><v-switch ref="consoleOpt" :class="ItemSel('Consoles', i * 2)" v-model="c.favorite" @change="UpdateConsoles" /></td>
                                        <td><v-switch ref="consoleOpt" :class="ItemSel('Consoles', i * 2 + 1)" v-model="c.hideUnfavorited" @change="UpdateConsoles" /></td>
                                    </tr>
                                    <tr>
                                        <td colspan="8" class="text-center">
                                            <i18n path="consoleNotFound">
                                                <a href="#" :class="ItemSel('Consoles', -2)" @click="AddNewConsole()">{{$t("consoleNotFoundInner")}}</a>
                                            </i18n>
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===3" class="mr-5">
                    <v-card-title>{{$t("tName")}}</v-card-title>
                    <v-card-text>
                        <p>
                            <i18n path="tExplanation">
                                <code>Kirby's Adventure (U) (PRG 1) [!]</code>
                                <em>Kirby's Adventure</em>
                                <em>US</em>
                                <em>Verified</em>
                                <em>PRG 1</em>
                            </i18n>
                        </p>
                        <div class="text-right mb-2">
                            <v-btn color="primary" @click="TryAddTag()" ref="addTag" :class="ItemSel('Tags', 0)">{{$t("tAdd")}}</v-btn>
                        </div>
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th width="80%" class="no-wrap">
                                            {{$t("tHeaderTag")}}
                                            <BeeTooltip :tooltip="$t('tSortName')">
                                                <v-btn icon :class="ItemSel('Tags', -4)" @click="TagSort('tag')">
                                                    <v-icon small color="grey" v-if="tagSortColumn !== 'tag'">mdi-sort</v-icon>
                                                    <v-icon small color="primary" v-if="tagSortColumn === 'tag' && tagSortAsc">mdi-sort-ascending</v-icon>
                                                    <v-icon small color="primary" v-if="tagSortColumn === 'tag' && !tagSortAsc">mdi-sort-descending</v-icon>
                                                </v-btn>
                                            </BeeTooltip>
                                        </th>
                                        <th class="no-wrap">
                                            {{$t("tHeaderGames")}}
                                            <BeeTooltip :tooltip="$t('tSortGames')">
                                                <v-btn icon :class="ItemSel('Tags', -5)" @click="TagSort('num')">
                                                    <v-icon small color="grey" v-if="tagSortColumn !== 'num'">mdi-sort</v-icon>
                                                    <v-icon small color="primary" v-if="tagSortColumn === 'num' && tagSortAsc">mdi-sort-ascending</v-icon>
                                                    <v-icon small color="primary" v-if="tagSortColumn === 'num' && !tagSortAsc">mdi-sort-descending</v-icon>
                                                </v-btn>
                                            </BeeTooltip>
                                        </th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="addingNewTag">
                                        <td><v-text-field :class="ItemSel('Tags', -1)" v-model="newTagName" @keyup.enter="SaveNewTag()" :placeholder="$t('tNewPrompt')" ref="newTag" /></td>
                                        <td></td>
                                        <td>
                                            <BeeTooltip :tooltip="$t('tNewSave')">
                                                <v-btn :class="ItemSel('Tags', -2)" icon color="success" @click="SaveNewTag()"><v-icon>mdi-check</v-icon></v-btn>
                                            </BeeTooltip>
                                            <BeeTooltip :tooltip="$t('tNewCancel')">
                                                <v-btn :class="ItemSel('Tags', -3)" icon color="error" @click="CancelNewTag()"><v-icon>mdi-close-circle</v-icon></v-btn>
                                            </BeeTooltip>
                                        </td>
                                    </tr>
                                    <tr v-for="(t, i) in tagList" :key="i" :ref="'tagTop' + (i + 1)">
                                        <td>{{tagList[i]}}</td>
                                        <td>{{tagXref[t] || 0}}</td>
                                        <td>
                                            <BeeTooltip :tooltip="$t('tDelete')">
                                                <v-btn :class="ItemSel('Tags', i + 1)" icon color="error" @click="DeleteTag(i)"><v-icon>mdi-delete</v-icon></v-btn>
                                            </BeeTooltip>
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===4" class="mr-5">
                    <v-card-title>{{$t("thName")}}</v-card-title>
                    <v-card-text>
                        <p>
                            <i18n path="thDesc">
                                <code>styles.json</code>
                            </i18n>
                            <BeeTooltip :tooltip="$t('thNavToStylesJson')">
                                <v-btn class="vert-mid" icon x-small color="primary" @click="OpenFolderToThemesJSON()"><v-icon>mdi-open-in-app</v-icon></v-btn>
                            </BeeTooltip>
                        </p>
                        <div class="text-center mb-4">
                            <v-btn color="primary" :class="ItemSel('Themes', -1)" small @click="showStyleGuide = true">{{$t("thShowGuide")}}</v-btn>
                        </div>
                        <v-simple-table dense>
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th class="text-center">{{$t("thHeadActive")}}</th>
                                        <th>{{$t("thHeadName")}}</th>
                                        <th>{{$t("thHeadPreview")}}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(s, i) in stylesArray" :class="ItemSel('Themes', i)" style="cursor:pointer" :key="s.key" @mouseover="PreviewTheme(s)" @mouseout="ReturnTheme()" @click="SelectTheme(s)">
                                        <td class="text-center"><v-icon v-if="configInfo.currentTheme === s.key" color="primary">mdi-check-decagram</v-icon></td>
                                        <td class="text-h5 py-2">{{s.name}}</td>
                                        <td>
                                            <v-btn small color="primary">{{$t("thPreviewButtonText")}}</v-btn>
                                            <v-btn small color="secondary" class="ml-2">{{$t("thPreviewButtonText")}}</v-btn>
                                        </td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===5" class="mr-5">
                    <v-card-title>{{$t("cnName")}}</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-card color="secondary">
                                    <v-card-title>{{$t("cnHeadGamepad")}}</v-card-title>
                                    <v-card-text>{{$t("cnDescGamepad")}}</v-card-text>
                                    <v-card-title class="pt-0">{{$t("cnHeadMouse")}}</v-card-title>
                                    <v-card-text>{{$t("cnDescMouse")}}</v-card-text>
                                </v-card>
                                <v-card color="secondary" class="mt-2">
                                    <v-card-title>{{$t("cnHeadDaisywheel")}}</v-card-title>
                                    <v-card-text>{{$t("cnDescDaisywheel")}}</v-card-text>
                                </v-card>
                            </v-col>
                            <v-col cols="6">
                                <v-card color="secondary">
                                    <v-card-title>{{$t("cnConsoleSelection")}}</v-card-title>
                                    <v-card-text>{{$t("cnConsoleSelectionDesc")}}</v-card-text>
                                    <v-card-title class="pt-0">{{$t("cnGameSelection")}}</v-card-title>
                                    <v-card-text>{{$t("cnGameSelectionDesc")}}</v-card-text>
                                    <v-card-title class="pt-0">{{$t("cnSettings")}}</v-card-title>
                                    <v-card-text>{{$t("cnSettingsDesc")}}</v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-card v-if="selected===6" class="mr-5">
                    <Credits />
                </v-card>
            </v-col>
        </v-row>
    </v-main>
    <v-dialog v-model="showStyleGuide">
        <v-card>
            <v-card-title>{{$t("tcgTitle")}}</v-card-title>
            <v-card-text>
                <div>
                    <i18n path="tcgBody">
                        <code>styles.json</code>
                        <BeeTooltip :tooltip="$t('thNavToStylesJson')">
                            <v-btn class="vert-mid" icon x-small color="primary" @click="OpenFolderToThemesJSON()"><v-icon>mdi-open-in-app</v-icon></v-btn>
                        </BeeTooltip>
                        <div style="font-family:monospace; margin-left:20px">
                            "CODE": {<br/>
                                &emsp;"name": "Name",<br/>
                                &emsp;"dark": true,<br/>
                                &emsp;"primary": "#FE0000",<br/>
                                &emsp;"secondary": "#7E7E7E"<br/>
                            }
                        </div>
                        <code>name</code>
                        <code>dark</code>
                        <code>true</code>
                        <code>false</code>
                        <strong>
                            <i18n path="tcgBodyWarn">
                                <code>dark</code>
                                <code>light</code>
                                <code>styles.json</code>
                            </i18n>
                        </strong>
                    </i18n>
                    <ul>
                        <li><code>primary</code>/<code>primaryText</code>: {{$t("tcgExplainPrimary")}}</li>
                        <li><code>secondary</code>/<code>secondaryText</code>: {{$t("tcgExplainSecondary")}}</li>
                        <li><code>success</code>/<code>successText</code>: {{$t("tcgExplainSuccess")}}</li>
                        <li><code>error</code>/<code>errorText</code>: {{$t("tcgExplainError")}}</li>
                        <li><code>depressed</code>: {{$t("tcgExplainDepressed")}}</li>
                        <li><code>borderRadius</code>: {{$t("tcgExplainButtonRadius")}}</li>
                        <li>
                            <code>customCSS</code>: 
                            <i18n path="tcgExplainCustomCSS">
                                <BeeTooltip :tooltip="$t('tcgOpenDevTools')">
                                    <v-btn class="vert-mid" icon x-small color="primary" @click="OpenDevTools()"><v-icon>mdi-code-braces-box</v-icon></v-btn>
                                </BeeTooltip>
                            </i18n>
                        </li>
                    </ul>
                    <i18n path="tcgExplainColors">
                        <span class="no-wrap">"rgb(255, 0, 0)"</span>
                        <span class="no-wrap">rgb(18, 70, 222)"</span>
                    </i18n>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="showStyleGuide = false">{{$t("tcgCloseDialog")}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="addingNewConsole">
        <v-card>
            <v-card-title>{{$t("consoleAddNewConsole")}}</v-card-title>
            <v-card-text>
                <p>{{$t("consoleAddNewInfo")}}</p>
                <v-row>
                    <v-col cols="4">
                        <v-text-field :class="ItemSel('newConsole', 0)" ref="newConsoleCode" v-model="newConsoleCode" maxlength="8" counter :label="$t('consoleAddNewShortCode')" :placeholder="$t('consoleAddNewShortCode')"></v-text-field>
                    </v-col>
                    <v-col cols="8">
                        <v-text-field :class="ItemSel('newConsole', 1)" ref="newConsoleName" v-model="newConsoleName" :label="$t('consoleAddNewName')" :placeholder="$t('consoleAddNewName')"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" :class="ItemSel('newConsole', 2)" text @click="SaveNewConsole()">{{$t("consoleAddNewSave")}}</v-btn>
                <v-btn color="secondary" :class="ItemSel('newConsole', 3)" text @click="CloseNewConsole()">{{$t("consoleAddNewCancel")}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-app>
</template>
<style scoped>
.vert-top { vertical-align: top }
.vert-mid { vertical-align: middle }
.v-card .control-hover::after {
    width: 0px;
    height: 0px;
}
</style>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Credits from '@/components/Credits.vue';
import config, { ConsoleInfo, EmulatorInfo, ConfigInfo, StyleInfo } from '@/models/Config';
import { KnownEmulators, KnownLibRetroCores } from '@/models/KnownEmulators';
import fileUtil from '@/utils/FileUtil';
import imageAPI from '@/utils/ImageAPI';
import { SetFullScreen, SwitchTheme, OpenDevTools, OpenDaisywheel } from '@/utils/MiscUtil';
import { GetInputFromVuetifyArray, GetInputFromVuetifyElement } from '@/utils/VueUtil';
@Component( { components: { Credits } })
export default class Settings extends Vue {
    selected = 0;
    settings = [
        { name: "Configuration", icon: "mdi-cog" },
        { name: "Emulators", icon: "mdi-code-greater-than" },
        { name: "Consoles", icon: "mdi-gamepad-square" },
        { name: "Tags", icon: "mdi-tag" },
        { name: "Themes", icon: "mdi-palette" },
        { name: "Controls", icon: "mdi-gamepad" },
        { name: "Credits", icon: "mdi-text" },
    ];
    displayStyles = [
        { key: "normal", title: this.$t("displayStyleStandard") },
        { key: "compact", title: this.$t("displayStyleCompact") },
        { key: "tile", title: this.$t("displayStyleTile") }
    ];

    configInfo: ConfigInfo|null = null;
    showChromeInfoText = false;
    apiTestLoading = false;
    apiResult = "";

    consolePathEditIdx = -1;
    consolePathEditDefault = "";
    consoles: ConsoleInfo[] = [];
    consoleSearch = "";
    addingNewConsole = false;
    newConsoleName = "";
    newConsoleCode = "";

    emulators: EmulatorInfo[] = [];
    consoleNameRef: {[key: string]: string} = {};
    emulatorsForConsole: {[key: string]: string[]} = {};

    tagList: string[] = [];
    tagXref: {[key: string]: number} = {};
    tagSortColumn = "";
    tagSortAsc = false;
    addingNewTag = false;
    newTagName = "";

    styles: {[key: string]: StyleInfo} = {};
    stylesArray: StyleInfo[] = [];
    showStyleGuide = false;

    navState = "menu";
    navSubstate = 0;
    lastState = 0;
    inDaisywheel = false;
    mounted(): void {
        this.configInfo = config.GetConfig();
        this.consoles = config.GetConsoles();
        this.consoles.forEach(c => { this.consoleNameRef[c.shortCode] = c.name; });
        this.emulators = config.GetEmulators();
        this.RefreshEmulatorList();
        const tagInfo = config.GetTags();
        this.tagList = tagInfo.tags;
        this.tagXref = tagInfo.xref;
        this.styles = config.GetStyles();
        for(const s in this.styles) {
            this.styles[s].key = s;
            this.stylesArray.push(this.styles[s]);
        }
        this.stylesArray.sort((a, b) => {
            if(this.configInfo?.currentTheme === a.key) {
                return -1;
            } else if(this.configInfo?.currentTheme === b.key) {
                return 1;
            } else if(a.key === "dark") {
                return -1;
            } else if(b.key === "dark") {
                return 1;
            } else if(a.key === "light") {
                return -1;
            } else if(b.key === "light") {
                return 1;
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        if(this.$router.currentRoute.query["console"]) {
            this.selected = 2;
            this.navState = "Consoles";
            this.navSubstate = 0;
            this.consoleSearch = this.$router.currentRoute.query["console"] as string;
        }
    }
    ShortPath(s: string): string { return fileUtil.ShortPath(s); }
    OpenFolderToFile(filePath: string): void { fileUtil.OpenFolder(filePath); }
    OpenFolderToThemesJSON(): void { fileUtil.ShowFile(config.GetStylePath()); }


//#region Gamepad
    MenuSel(i: number): string { return (this.navState === "menu" && this.navSubstate === i) ? "control-hover" : ""; }
    ItemSel(state: string, i: number): string { return (this.navState === state && this.navSubstate === i) ? "control-hover" : ""; }
    BtnA(): void {
        if(this.inDaisywheel) { return; }
        if(this.navState === "menu") {
            if(this.navSubstate < 0) {
                this.$router.push("/");
            } else {
                switch(this.navSubstate) {
                    case 1:
                        this.$emit("err", this.$t("gpEmuMouseOnly"));
                        break;
                    case 5:
                    case 6:
                        break;
                    default: 
                        this.selected = this.navSubstate;
                        this.navSubstate = 0;
                        this.navState = this.settings[this.selected].name;
                        break;
                }
            }
        } else if(this.navState === "Configuration") {
            if(!this.configInfo) { return; }
            switch(this.navSubstate) {
                case 0:
                    this.inDaisywheel = true;
                    OpenDaisywheel(this, "regioninput", "dwPreferredRegion", this.configInfo.primaryRegion, s => {
                        if(!this.configInfo) { return; }
                        this.configInfo.primaryRegion = s;
                        this.UpdateConfig();
                        this.inDaisywheel = false;
                    }, s => {
                        if(!this.configInfo) { return; }
                        this.configInfo.primaryRegion = s;
                    });
                    break;
                case 1:
                    this.configInfo.fullscreen = !this.configInfo.fullscreen;
                    this.UpdateConfig();
                    break;
                case 2:
                    this.configInfo.showChrome = !this.configInfo.showChrome;
                    this.UpdateConfig();
                    break;
                case 3:
                    this.configInfo.useGiantBombAPI = !this.configInfo.useGiantBombAPI;
                    this.UpdateConfig();
                    break;
                case 4:
                    this.inDaisywheel = true;
                    OpenDaisywheel(this, "apiinput", "dwAPIKey", this.configInfo.giantBombAPIKey, s => {
                        if(!this.configInfo) { return; }
                        this.configInfo.giantBombAPIKey = s;
                        this.UpdateConfig();
                        this.inDaisywheel = false;
                    }, s => {
                        if(!this.configInfo) { return; }
                        this.configInfo.giantBombAPIKey = s;
                    });
                    break;
                case 5:
                    this.TestGiantBombAPI();
                    break;
                case 6:
                    this.configInfo = {
                        primaryRegion: this.configInfo.primaryRegion,
                        fullscreen: this.configInfo.fullscreen,
                        showChrome: this.configInfo.showChrome,
                        giantBombAPIKey: this.configInfo.giantBombAPIKey,
                        useGiantBombAPI: this.configInfo.useGiantBombAPI,
                        currentTheme: this.configInfo.currentTheme,
                        viewType: (this.configInfo.viewType === "normal" ? "compact" : (this.configInfo.viewType === "compact" ? "tile" : "normal")),
                        tilesPerRow: this.configInfo.tilesPerRow
                    };
                    this.UpdateConfig();
                    break;
                 case 7:
                    this.configInfo = {
                        primaryRegion: this.configInfo.primaryRegion,
                        fullscreen: this.configInfo.fullscreen,
                        showChrome: this.configInfo.showChrome,
                        giantBombAPIKey: this.configInfo.giantBombAPIKey,
                        useGiantBombAPI: this.configInfo.useGiantBombAPI,
                        currentTheme: this.configInfo.currentTheme,
                        viewType: this.configInfo.viewType,
                        tilesPerRow: this.configInfo.tilesPerRow + 1
                    };
                    this.UpdateConfig();
                    break;
            }
        } else if(this.navState === "Themes") {
            if(this.navSubstate < 0) {
                this.showStyleGuide = true;
            } else {
                this.SelectTheme(this.stylesArray[this.navSubstate]);
            }
        } else if(this.navState === "Tags") {
            if(this.navSubstate === 0) { // add new
                this.TryAddTag(true);
            } else if(this.navSubstate === -4) {
                this.TagSort("tag");
            } else if(this.navSubstate === -5) {
                this.TagSort("num");
            } else if(this.navSubstate === -3) {
                this.CancelNewTag();
            } else if(this.navSubstate === -2) {
                this.SaveNewTag();
            } else if(this.navSubstate === -1) {
                this.OpenNewTagDaisywheel();
            } else { // delete
                this.DeleteTag(this.navSubstate - 1);
                if(this.navSubstate > this.tagList.length) {
                    this.navSubstate = this.tagList.length;
                }
            }
        } else if(this.navState === "Consoles") {
            if(this.navSubstate === -2) {
                this.AddNewConsole();
            } else if(this.navSubstate === -1) {
                this.inDaisywheel = true;
                OpenDaisywheel(this, "search", "consoleSettingsSearchDW", this.consoleSearch, s => {
                    this.consoleSearch = s;
                    this.inDaisywheel = false;
                }, s => {
                    this.consoleSearch = s;
                });
            } else {
                GetInputFromVuetifyArray(this, "consoleOpt", this.navSubstate).click();
            }
        } else if(this.navState === "newConsole") {
            if(this.navSubstate === 0) {
                this.inDaisywheel = true;
                OpenDaisywheel(this, "newConsoleCode", "consoleAddNewShortCode", this.newConsoleCode, s => {
                    this.newConsoleCode = s;
                    this.inDaisywheel = false;
                }, s => {
                    this.newConsoleCode = s;
                });
            } else if(this.navSubstate === 1) {
                this.inDaisywheel = true;
                OpenDaisywheel(this, "newConsoleName", "consoleAddNewName", this.newConsoleName, s => {
                    this.newConsoleName = s;
                    this.inDaisywheel = false;
                }, s => {
                    this.newConsoleName = s;
                });
            } else if(this.navSubstate === 2) {
                this.SaveNewConsole();
            } else {
                this.CloseNewConsole();
            }
        }
    }
    BtnX(): void {
        if(this.navState === "Configuration" && this.navSubstate === 7 && this.configInfo) {
            this.configInfo = {
                primaryRegion: this.configInfo.primaryRegion,
                fullscreen: this.configInfo.fullscreen,
                showChrome: this.configInfo.showChrome,
                giantBombAPIKey: this.configInfo.giantBombAPIKey,
                useGiantBombAPI: this.configInfo.useGiantBombAPI,
                currentTheme: this.configInfo.currentTheme,
                viewType: this.configInfo.viewType,
                tilesPerRow: Math.max(this.configInfo.tilesPerRow - 1, 1)
            };
            this.UpdateConfig();
        }
    }
    BtnB(): void {
        if(this.inDaisywheel) { return; }
        if(this.addingNewConsole) {
            this.CloseNewConsole();
        } else if(this.showStyleGuide) {
            this.showStyleGuide = false;
        } else if(this.navState === "Tags" && this.navSubstate < 0) {
            this.navSubstate = 0;
            this.addingNewTag = false;
            this.newTagName = "";
        } else if(this.navState === "menu") {
            if(this.navSubstate < 0) {
                this.$router.push("/");
            } else {
                this.navSubstate = -1;
            }
        } else {
            this.navState = "menu";
            this.navSubstate = this.selected;
        }
    }
    MvRight(): void { this.Navigate(1, 0); }
    MvLeft(): void { this.Navigate(-1, 0); }
    MvUp(): void { this.Navigate(0, -1); }
    MvDown(): void { this.Navigate(0, 1); }
    Navigate(x: number, y: number): void {
        if(this.inDaisywheel) { return; }
        if(this.navState === "menu") {
            if(this.navSubstate === -1 && y < 0) { return; }
            if(this.navSubstate === (this.settings.length - 1) && y > 0) { return; }
            this.navSubstate += y;
            this.selected = this.navSubstate;
        } else if(this.navState === "Configuration") {
            const move = x * 10 + y; // down = 1, up = -1, left = -10, right = 10
            switch(this.navSubstate) {
                case 0: // Preferred ROM Region
                    switch(move) {
                        case 1: this.navSubstate = 1; break;
                        case 10: this.navSubstate = 3; break;
                    }
                    break;
                case 1: // Full Screen
                    switch(move) {
                        case -1: this.navSubstate = 0; break;
                        case 10: this.navSubstate = 2; break;
                        case 1: this.navSubstate = 6; break;
                    }
                    break;
                case 2: // Chrome Window
                    switch(move) {
                        case -1: this.navSubstate = 0; break;
                        case -10: this.navSubstate = 1; break;
                        case 10: this.navSubstate = this.configInfo?.useGiantBombAPI ? 5 : 3; break;
                        case 1: this.navSubstate = 6; break;
                    }
                    break;
                case 3: // Use API?
                    switch(move) {
                        case 1: this.navSubstate = 5; break;
                        case 10: if(this.configInfo?.useGiantBombAPI) { this.navSubstate = 4; } break;
                        case -10: this.navSubstate = 0; break;
                    }
                    break;
                case 4: // API Key
                    switch(move) {
                        case 1: this.navSubstate = 5; break;
                        case -10: this.navSubstate = 3; break;
                    }
                    break;
                case 5: // Test
                    switch(move) {
                        case -1: this.navSubstate = 3; break;
                        case -10: this.navSubstate = this.configInfo?.viewType === "tile" ? 7 : 6; break;
                    }
                    break;
                case 6: // Display Style
                    switch(move) {
                        case -1: this.navSubstate = 1; break;
                        case 10: this.navSubstate = this.configInfo?.viewType === "tile" ? 7 : (this.configInfo?.useGiantBombAPI ? 5 : 3); break;
                    }
                    break;
                case 7: // Tiles Per Row
                    switch(move) {
                        case -1: this.navSubstate = 2; break;
                        case -10: this.navSubstate = 6; break;
                        case 10: this.navSubstate = this.configInfo?.useGiantBombAPI ? 5 : 3; break;
                    }
                    break;
            }
        } else if(this.navState === "Themes") {
            this.navSubstate += y;
            if(this.navSubstate < -1) { this.navSubstate = -1; }
            else if(this.navSubstate >= this.stylesArray.length) { this.navSubstate = this.stylesArray.length; }
            if(this.navSubstate >= 0) {
                this.PreviewTheme(this.stylesArray[this.navSubstate]);
            }
        } else if(this.navState === "Tags") { // 0 = add new, -1 = input, -2 = accept, -3 = reject, -4 = sort name, -5 = sort count, 1+ = idx+1 delete
            if(this.navSubstate === 0) { // Add Tag to Sort by Games With Tag
                if(y > 0) { this.navSubstate = -5; }
            } else if(this.navSubstate <= -4) {
                if(y > 0) { // Sort to first Tag
                    this.navSubstate = 1;
                } else if(y < 0) { // Sort to Add New
                    this.navSubstate = 0;
                } else if(x < 0) { // to Name Sort
                    this.navSubstate = -4;
                } else if(x > 0) { // to Tag Sort
                    this.navSubstate = -5;
                }
            } else if(this.navSubstate < 0) { // New Tag
                if(x < 0) { // to Input
                    this.navSubstate = -1;
                } else if(x > 0 && this.navSubstate === -1) { // to Accept
                    this.navSubstate = -2;
                } else if(this.navSubstate !== -1) {
                    if(y > 0 || x > 0) { // to Reject
                        this.navSubstate = -3;
                    } else if(y < 0) { // to Accept
                        this.navSubstate = -2;
                    }
                }
            } else {
                if(this.navSubstate === 1 && y < 0) {
                    this.navSubstate = -5;
                    window.scrollTo(0, 0);
                } else {
                    this.navSubstate += y;
                    if(this.navSubstate > this.tagList.length) {
                        this.navSubstate = this.tagList.length;
                    }
                }
            }
        } else if(this.navState === "Consoles") {
            const isRight = this.navSubstate % 2 === 1;
            const conslen = this.FilteredConsoles.length;
            if(x < 0 && isRight) {
                this.navSubstate -= 1;
            } else if(x > 0 && !isRight) {
                this.navSubstate += 1;
            } else if(y < 0 && this.navSubstate <= 1) {
                if(this.navSubstate === -2) { // moving from "add new" to last console
                    this.navSubstate = (conslen * 2) - (isRight ? 1 : 2);
                } else { // moving from top console to search
                    this.navSubstate = -1;
                }
            } else if(y > 0 && this.navSubstate === -1) {
                this.navSubstate = 0;
            } else {
                this.navSubstate += 2 * y;
                if(this.navSubstate >= (conslen * 2)) {
                    this.navSubstate = -2;
                } else {
                    if(this.navSubstate < 0) {
                        this.navSubstate = isRight ? 1 : 0;
                    }
                    const actualIdx = (this.navSubstate - (isRight ? 1 : 0)) / 2;
                    if(actualIdx < 3) {
                        this.$vuetify.goTo(0);
                    } else {
                        this.$vuetify.goTo((this.$refs["console"] as Vue[])[actualIdx]);
                    }
                }
            }
        } else if(this.navState === "newConsole") {
            if((x > 0 && this.navSubstate === 0) || (y < 0 && this.navSubstate > 1)) {
                this.navSubstate = 1;
            } else if(x < 0 && this.navSubstate === 1) {
                this.navSubstate = 0;
            } else if((y > 0 && this.navSubstate <= 1) || (x < 0 && this.navSubstate === 3)) {
                this.navSubstate = 2;
            } else if(x > 0 && this.navSubstate === 2) {
                this.navSubstate = 3;
            }
        }
    }
    OpenNewTagDaisywheel(): void {
        this.inDaisywheel = true;
        OpenDaisywheel(this, "newTag", "dwEnterTag", this.newTagName, s => {
            this.newTagName = s;
            this.inDaisywheel = false;
        }, s => { this.newTagName = s; });
    }
//#endregion
//#region Settings
    UpdateConfig(): void {
        if(!this.configInfo) { return; }
        const oldConfig: ConfigInfo = config.GetConfig();
        this.configInfo.giantBombAPIKey = (this.configInfo.giantBombAPIKey || "").trim();
        config.UpdateConfig(this.configInfo);
        if(this.configInfo.fullscreen !== oldConfig.fullscreen) {
            SetFullScreen(this.configInfo.fullscreen);
        } else if(this.configInfo.showChrome !== oldConfig.showChrome) {
            this.showChromeInfoText = true;
        }
    }
    async TestGiantBombAPI(): Promise<void> {
        try {
            this.apiResult = "";
            this.apiTestLoading = true;
            this.apiResult = await imageAPI.GetGameImage("Shrek 2", "GCN", false, true);
            this.$emit("msg", this.$t("boxArtApiTestSuccess"));
        } catch {
            this.$emit("err", this.$t("boxArtApiTestFailure"));
        } finally {
            this.apiTestLoading = false;
        }
    }
    OpenImagesFolder(): void { fileUtil.OpenFolder(config.GetImagesPath()); }
    OpenAPIInfoURL(): void { fileUtil.OpenLink("https://www.giantbomb.com/api/"); }
//#endregion
//#region Consoles
    get FilteredConsoles(): ConsoleInfo[] {
        const query = (this.consoleSearch || "").toLowerCase();
        if(!query) { return this.consoles; }
        return this.consoles.filter(c => c.name.toLowerCase().indexOf(query) >= 0 || c.shortCode.toLowerCase().indexOf(query) >= 0);
    }
    UpdateConsoles(): void { this.consolePathEditIdx = -1; config.SaveConsoles(this.consoles); }
    ImgUploadClick(console: string): void {
        (this.$refs["imgUpload" + console] as HTMLElement[])[0].click();
    }
    UploadImage(console: ConsoleInfo, e: InputEvent): void {
        const files = (e.target as HTMLInputElement).files;
        if(!files || files.length !== 1) { return; }
        if(files[0].type.indexOf("image/") !== 0) {
            this.$emit("msg", { msg: this.$t("errInvalidImageType"), error: true });
            return;
        }
        const file = files[0];
        console.image = file.path;
        config.SaveConsoles(this.consoles);
    }
    SortConsoles(): void {
        this.consoles.sort((a, b) => {
            const aHasPath = !!a.path, bHasPath = !!b.path;
            if(aHasPath && !bHasPath) {
                return -1;
            } else if(bHasPath && !aHasPath) {
                return 1;
            }
            const aHasEmus = (this.emulatorsForConsole[a.shortCode] || []).length > 0;
            const bHasEmus = (this.emulatorsForConsole[b.shortCode] || []).length > 0;
            if(aHasEmus && !bHasEmus) {
                return -1;
            } else if(bHasEmus && !aHasEmus) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
    }
    AddNewConsole(): void {
        this.addingNewConsole = true;
        this.newConsoleName = "";
        this.newConsoleCode = "";
        this.navState = "newConsole";
        this.lastState = this.navSubstate;
        this.navSubstate = 0;
        this.$nextTick(() => {
            setTimeout(() => { // $nextTick on its own doesn't work since the dialog animates first and doesn't finish immediately 
                GetInputFromVuetifyElement(this, "newConsoleCode").focus();
            }, 500);
        });
    }
    CloseNewConsole(): void {
        this.addingNewConsole = false;
        this.navSubstate = this.lastState;
        this.navState = "Consoles";
    }
    SaveNewConsole(): void {
        if(!this.newConsoleName) { this.$emit("err", this.$t("errEnterConsoleName")); return; }
        if(!this.newConsoleCode) { this.newConsoleCode = this.newConsoleName.replace(/[^A-Z0-9]/g, "") || this.newConsoleName.substring(0, 6); } 
        this.consoles.push({
            name: this.newConsoleName,
            shortCode: this.newConsoleCode,
            default: false, 
            extensions: [],
            path: "",
            preferredEmulator: "",
            favorite: false,
            hideUnfavorited: false
        });
        config.SaveConsoles(this.consoles);
        this.SortConsoles();
        this.addingNewConsole = false;
        this.navSubstate = this.lastState;
        this.navState = "Consoles";
        this.$emit("msg", this.$t("youCanUseConsole", [this.newConsoleName]));
    }
//#endregion
//#region ROM Path Selection
    // Text Selection
    SelectROMInput(idx: number): void {
        this.consolePathEditIdx = idx;
        this.consolePathEditDefault = this.FilteredConsoles[idx].path;
        this.$nextTick(() => {
            (this.$refs["romPath" + idx] as HTMLInputElement[])[0].focus();
        });
    }
    ConfirmROMInputChanges(): void {
        this.FilteredConsoles[this.consolePathEditIdx].path = this.consolePathEditDefault;
        this.UpdateConsoles();
    }
    CancelROMInputChanges(): void {
        this.consolePathEditIdx = -1;
        this.consolePathEditDefault = "";
    }

    // Browse Selection
    ROMFolderSelectClick(console: string): void { (this.$refs["romFolder" + console] as HTMLElement[])[0].click(); }
    UploadROMFolder(console: ConsoleInfo, e: InputEvent): void {
        const files = (e.target as HTMLInputElement).files;
        if(!files || !files.length) { // this error may never even show up if the empty directory upload isn't even recognized as a change event :(
            this.$emit("err", this.$t("errNoDirectory"));
            return;
        }
        console.path = fileUtil.GetFileDirectory(files[0].path);
        config.SaveConsoles(this.consoles);
    }
//#endregion
//#region Emulators
    EmulatorSelect(e: InputEvent): void {
        const files = (e.target as HTMLInputElement).files;
        if(!files || files.length !== 1) { return; }
        const file = files[0];
        const emuName = file.name.replace(/\.(exe|dmg|app)/g, "").replace(/(_-).*/, ""), emuKey = emuName.toLowerCase();
        if(emuKey === "retroarch") {
            const cores = fileUtil.GetRetroarchCores(file.path);
            cores.forEach(core => {
                const coreKey = fileUtil.GetRetroarchCoreName(core);
                const coreName = `RetroArch (${coreKey})`;
                if(this.emulators.some(oe => oe.name === coreName && oe.path === file.path)) { return; } // prevent duplicates
                if(KnownLibRetroCores[coreKey]) {
                    this.emulators.push({ name: coreName, path: file.path, consoles: KnownLibRetroCores[coreKey], args: ["-L", core, "-f", "%ROM%"] });
                } else {
                    this.emulators.push({ name: coreName, path: file.path, consoles: [], args: ["-L", core, "-f", "%ROM%"] });
                }
            });
        } else if(KnownEmulators[emuKey]) {
            const es = KnownEmulators[emuKey];
            for(let i = 0; i < es.length; i++) {
                const e = es[i];
                if(this.emulators.some(oe => oe.name === e.name && oe.path === file.path)) { return; } // prevent duplicates
            }
            this.emulators.push(...es.map(e => ({ name: e.name, path: file.path, consoles: e.consoles, args: e.args })));
        } else {
            this.emulators.push({ name: emuName, path: file.path, consoles: [], args: ["%ROM%"] });
        }
        config.SaveEmulators(this.emulators);
    }
    UpdateEmulators(): void {
        config.SaveEmulators(this.emulators);
        this.consoles = config.GetConsoles();
        this.RefreshEmulatorList();
    }
    RefreshEmulatorList(): void {
        this.emulatorsForConsole = {};
        this.emulators.forEach(e => {
            e.consoles.forEach(c => {
                if(this.emulatorsForConsole[c]) {
                    this.emulatorsForConsole[c].push(e.name);
                } else {
                    this.emulatorsForConsole[c] = [e.name];
                }
            });
        });
        this.consoles.forEach(c => {
            if(!this.emulatorsForConsole[c.shortCode]) { return; }
            const len = this.emulatorsForConsole[c.shortCode].length;
            const potentialIdx = this.emulatorsForConsole[c.shortCode].indexOf(c.preferredEmulator);
            if(potentialIdx >= 0) {
                c.preferredEmulator = this.emulatorsForConsole[c.shortCode][potentialIdx];
            } else if(len === 1) {
                c.preferredEmulator = this.emulatorsForConsole[c.shortCode][0];
            } else if(len === 0) {
                c.preferredEmulator = "";
            }
        });
        this.SortConsoles();
    }
    DeleteEmulator(idx: number): void {
        this.emulators.splice(idx, 1);
        this.UpdateEmulators();
    }
//#endregion
//#region Tags
    TryAddTag(fromGamepad = false): void {
        this.addingNewTag = true;
        this.newTagName = "";
        this.navSubstate = -1;
        this.$nextTick(() => {
            ((this.$refs["newTag"] as Vue).$el.querySelector("input") as HTMLInputElement).focus();
            if(fromGamepad) { this.OpenNewTagDaisywheel(); }
        })
    }
    SaveNewTag(): void {
        if(!this.newTagName.trim()) { this.$emit("err", this.$t("errEmptyTag")); return; }
        this.tagList.push(this.newTagName);
        config.SaveTags(this.tagList);
        this.addingNewTag = false;
        this.newTagName = "";
        this.navSubstate = 0;
    }
    CancelNewTag(): void {
        this.addingNewTag = false;
        this.newTagName = "";
        this.navSubstate = 0;
    }
    TagSort(type: string): void {
        if(type === this.tagSortColumn) {
            this.tagSortAsc = !this.tagSortAsc;
        } else {
            this.tagSortColumn = type;
            this.tagSortAsc = true;
        }
        this.tagList.sort((a, b) => {
            const left = this.tagSortAsc ? a : b;
            const right = this.tagSortAsc ? b : a;
            if(type === "tag") {
                return left.localeCompare(right);
            } else {
                return (this.tagXref[left] || 0) - (this.tagXref[right] || 0);
            }
        });
        config.SaveTags(this.tagList);
    }
    DeleteTag(i: number): void {
        delete this.tagXref[this.tagList[i]];
        config.PurgeTag(this.tagList[i]);
        this.tagList.splice(i, 1);
        config.SaveTags(this.tagList);
    }
//#endregion
//#region Styles
    PreviewTheme(s: StyleInfo): void { SwitchTheme(this, s, s.dark ? this.styles["dark"] : this.styles["light"]); }
    ReturnTheme(): void {
        if(!this.configInfo) { return; }
        const theme = this.styles[this.configInfo.currentTheme];
        this.PreviewTheme(theme); 
    }
    SelectTheme(s: StyleInfo): void {
        if(!this.configInfo) { return; }
        this.PreviewTheme(s);
        this.configInfo.currentTheme = s.key || "dark";
        config.UpdateConfig(this.configInfo);
    }
    OpenDevTools(): void { OpenDevTools(); }
//#endregion
}
</script>