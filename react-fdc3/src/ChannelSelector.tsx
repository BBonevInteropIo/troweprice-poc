import chroma from "chroma-js";
import Select from "react-select";
import { NO_CHANNEL_VALUE } from "./constants";
import { Channel } from "@glue42/fdc3";

// The value that will be displayed inside the channel selector widget to leave the current channel.

// The CSS for the color dot that will appear next to each item inside the channel selector widget menu.
const dot = (color = "#ccc") => ({
    alignItems: "center",
    display: "flex",

    ":before": {
        backgroundColor: color,
        borderRadius: 10,
        content: '" "',
        display: "block",
        marginRight: 8,
        height: 10,
        width: 10
    }
});

// The CSS for the different UI components of the channel selector widget.
const colorStyles = {
    container: (styles: any) => ({ ...styles, width: "148px" }),
    control: (styles: any) => ({ ...styles, backgroundColor: "white" }),
    option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
        const color = chroma(data.color || "#E4E5E9");
        return {
            ...styles,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? data.color
                    : isFocused
                        ? color.alpha(0.1).css()
                        : null,
            color: isDisabled
                ? "#ccc"
                : isSelected
                    ? chroma.contrast(color, "white") > 2
                        ? "white"
                        : "black"
                    : data.color,
            cursor: isDisabled ? "not-allowed" : "default",
            width: "148px",
            ":active": {
                ...styles[":active"],
                backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
            },
        };
    },
    input: (styles: any) => ({ ...styles, ...dot() }),
    placeholder: (styles: any) => ({ ...styles, ...dot() }),
    singleValue: (styles: any, { data }: any) => ({ ...styles, ...dot(data.color) })
};

interface ChannelSelectorWidgetProps {
  channels: Channel[]
  onChannelSelected: CallableFunction
  startingChannel?: string
}

function ChannelSelectorWidget({ channels = [], onChannelSelected = () => {}, startingChannel }: ChannelSelectorWidgetProps) {
    // The default channel that will always be part of the channel selector widget.
    const defaultChannel = {
        value: NO_CHANNEL_VALUE,
        label: NO_CHANNEL_VALUE
    };
    
    if (startingChannel) {
        defaultChannel.value = startingChannel;
        defaultChannel.label = startingChannel;
    }

    const options = [
        defaultChannel,
        ...channels.map((channel) => ({
            value: channel.id,
            label: channel.displayMetadata?.name || '',
            color: channel.displayMetadata?.color || ''
        }))
    ];

    const onChange = (target: any) => {
        onChannelSelected(target);
    };

    return (
        <Select
            defaultValue={defaultChannel}
            options={options}
            styles={colorStyles}
            onChange={onChange}
            isSearchable={false}
        />
    );
}

export default ChannelSelectorWidget;
