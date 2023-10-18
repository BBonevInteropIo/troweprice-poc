import { useState, useEffect, useContext } from 'react'
import { GlueContext } from '@glue42/react-hooks'
import '@glue42/theme/dist/packages/rc-select.css'
import Select, { components } from 'react-select'
import chroma from 'chroma-js'
import { Glue42 } from '@glue42/desktop'
import { Glue42Web } from '@glue42/web'

import { Button } from 'reactstrap'

const sleep = (ms: number): Promise<number> => {
    return new Promise((resolve) => setTimeout(resolve, ms || 100))
}

type GlueChannelContextT =
    | Glue42Web.Channels.ChannelContext
    | Glue42.Channels.ChannelContext


type GlueT = Glue42.Glue | Glue42Web.API


interface ChannelComboOption {
    value: string
    label: string
    color: string
}

const noneOption: ChannelComboOption = {
    value: '',
    label: 'None',
    color: 'rgba(0,0,0,0)',
}

const listGlueChannels = async (
    glue: GlueT
): Promise<GlueChannelContextT[]> => {
    let list = ((await glue?.channels?.list()).filter(x => x.meta?.fdc3)) ?? []
    if (list) {
        for (let i = 0; i < 5; i++) {
            if (list.length > 0 && list[0].meta) break
            //console.log("Invalid channels returned",list)
            await sleep(500)
            list = (await glue?.channels.list()).filter(x => x.meta?.fdc3)
        }
    }
    if (!list || list.length === 0 || !list[0].meta) {
        return []
    }
    return list
}

const getDisplaySelectedOption = (
    opt: ChannelComboOption
): ChannelComboOption => ({
    value: opt.value,
    label: '☍',
    color: opt.color,
})

const CustomSelectOption = (props: any) => {
    const backgroundColor = props?.data?.color || 'rgba(0,0,0,0)'
    const bgColorChroma = chroma(backgroundColor)
    const color = !props?.data?.value
        ? 'inherit'
        : props.isSelected || props.isFocused
        ? chroma.contrast(bgColorChroma, 'white') > 2
            ? 'white'
            : 'black'
        : backgroundColor

    return (
        <div
            style={{
                color,
                backgroundColor,
                textAlign: 'center',
            }}
        >
            <components.Option {...props} />
        </div>
    )
}

let baseSize = 1.4
const CustomSelectControl = (props: any) => {
    const selectedVal = props?.selectProps?.value
    const backgroundColor = selectedVal?.color || 'rgba(0,0,0,0)'
    const bgColorChroma = chroma(backgroundColor)
    const color = !selectedVal?.value
        ? 'inherit'
        : chroma.contrast(bgColorChroma, 'white') > 2
        ? 'white'
        : 'black'

    return (
        <Button
            style={{
                color,
                backgroundColor,
                lineHeight: baseSize + 'rem',
                padding: '0 ' + baseSize * 0.2 + 'rem',
                fontSize: baseSize + 'rem',
                cursor: 'default',
                userSelect: 'none',
            }}
            onClick={(e: any) => {
                if (props.selectProps.menuIsOpen) {
                    props.selectProps.onMenuClose()
                } else {
                    props.selectProps.onMenuOpen()
                }
            }}
            onBlur={(e: any) => {
                props.selectProps.onMenuClose()
            }}
        >
            {selectedVal?.label}
        </Button>
    )
}

let savedChannelOptions: ChannelComboOption[] = []

export interface ChannelSelectorProps {
    defaultChannel?: string
    baseSize?: number
}

const ChannelSelector = (props: ChannelSelectorProps) => {
    const [channelOptions, setChannelOptions] = useState<ChannelComboOption[]>(
        []
    )
    const [selectedChannel, setSelectedChannel] = useState<ChannelComboOption>(
        getDisplaySelectedOption(noneOption)
    )
    const glue: GlueT | undefined = useContext(GlueContext)
    props?.baseSize && (baseSize = props.baseSize)

    const setChannelByName = (name: string) => {
        const option =
            savedChannelOptions.find((opt) => opt.value === name) || noneOption

        console.log('================', option, '===================')

        setSelectedChannel(getDisplaySelectedOption(option))
        if (option.value === '') {
            glue.channels.leave().catch(console.error)
        } else {
            glue.channels.join(option.value).catch(console.error)
        }
    }

    useEffect(() => {
        if (glue == null) {
            return
        }

        ;(async () => {
            const allChannels = await listGlueChannels(glue)
            console.log('All Channels', allChannels)
            const cOptions: ChannelComboOption[] = [noneOption]
            cOptions.push(
                ...allChannels.map((c) => {
                    return {
                        value: c.name,
                        label: '✔',
                        color: c.meta.color,
                    }
                })
            )

            setChannelOptions(cOptions)

            savedChannelOptions = [...cOptions]

            setTimeout(() => {
                setChannelByName(props.defaultChannel ?? '')
            }, 500)
        })()
    }, [glue, props.defaultChannel])

    return (
        <div style={{}}>
            <Select
                classNamePrefix="select"
                className="channel-selector"
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    Option: CustomSelectOption,
                    Control: CustomSelectControl,
                }}
                //isSearchable={false}
                styles={{
                    menu: ({ width, ...styles }) => ({
                        ...styles,
                        width: '4rem',
                    }),
                }}
                options={channelOptions}
                value={selectedChannel}
                menuPlacement="auto"
                maxMenuHeight={640}
                onChange={(sel: any) => {
                    setSelectedChannel(getDisplaySelectedOption(sel))

                    if (sel.value === '') {
                        glue.channels.leave().catch(console.error)
                    } else {
                        glue.channels.join(sel.value).catch(console.error)
                    }
                }}
            />
        </div>
    )
}

export default ChannelSelector
