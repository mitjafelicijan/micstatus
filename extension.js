import Gvc from "gi://Gvc";
import St from "gi://St";

import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";

export default class MicrophoneStatusExtension extends Extension {
	enable() {
		this.indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
		this.icon = new St.Icon({
			icon_name: "audio-input-microphone-symbolic",
			style_class: "mic-status-indicator mic-status-indicator-off",
		});
		this.indicator.add_child(this.icon);
		Main.panel.addToStatusArea(this.uuid, this.indicator);

		this.micControl = new Gvc.MixerControl({ name: "MicStatusExtension" });
		this.micControl.open();
		this.micControl.connect("state-changed", () => {
			if (this.micControl.get_state() === Gvc.MixerControlState.READY) {
				this.updateMicSource();
			}
		});
	}

	updateMicSource() {
		const sources = this.micControl.get_sources();
		const defaultSource = this.micControl.get_default_source();

		if (!defaultSource) {
			log("No default mic source found");
			return;
		}

		this.updateIcon(defaultSource.is_muted);
		defaultSource.connect("notify::is-muted", () => {
			this.updateIcon(defaultSource.is_muted);
		});
	}

	updateIcon(isMuted) {
		if (isMuted) {
			this.icon.icon_name = 'microphone-disabled-symbolic';
			this.icon.set_style_class_name("mic-status-indicator mic-status-indicator-off");
		} else {
			this.icon.icon_name = 'audio-input-microphone-symbolic';
			this.icon.set_style_class_name("mic-status-indicator mic-status-indicator-on");
		}
	}

	disable() {
		this.indicator?.destroy();
		this.indicator = null;
	}
}
