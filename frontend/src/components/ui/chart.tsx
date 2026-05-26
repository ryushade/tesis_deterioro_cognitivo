import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { [key: string]: { label: string, color?: string, icon?: React.ComponentType } }
export type ChartConfig = {
  [key: string]: {
    label: React.ReactNode
    color?: string
    icon?: React.ComponentType
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        style={
          {
            ...Object.entries(config).reduce((acc, [key, item]) => {
              if (item.color) {
                acc[`--color-${key}`] = item.color
              }
              return acc
            }, {} as Record<string, string>),
            "--chart-style-id": chartId,
          } as React.CSSProperties
        }
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border [&_.recharts-cartesian-grid-vertical_line]:stroke-border [&_.recharts-curve.recharts-area]:opacity-50 [&_.recharts-dot]:stroke-background [&_.recharts-grid-line]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-line]:stroke-2 [&_.recharts-sector]:stroke-background [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromItems(payload, key, config)
      const value =
        labelKey || typeof label === "string"
          ? config[label as string]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium text-slate-800 dark:text-slate-100", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium text-slate-800 dark:text-slate-100", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "line"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromItems(payload, key, config)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "line" && "items-center"
                )}
              >
                {formatter && item.value !== undefined && item.name !== undefined ? (
                  formatter(item.value, item.name, item, index, payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[inherit]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-l border-dashed": indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              backgroundColor: indicatorColor,
                              borderColor: indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between gap-1.5 leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-0.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-slate-500 dark:text-slate-400">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && (
                        <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = `${nameKey || item.dataKey || item.value || "value"}`
        const itemConfig = getPayloadConfigFromItems(payload, key, config)

        return (
          <div
            key={item.value || index}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              !hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )
            )}
            <span>{itemConfig?.label || item.value}</span>
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

// Helper to get config from payload items.
function getPayloadConfigFromItems(
  payload: any[],
  key: string,
  config: ChartConfig
) {
  if (typeof key !== "string") {
    return undefined
  }

  const payloadPayload = payload.find((item) => {
    const payloadKey = item.dataKey || item.name
    return (
      payloadKey === key ||
      item.payload?.[key] !== undefined ||
      item.payload?.[payloadKey] !== undefined
    )
  })

  let configKey = key

  if (payloadPayload) {
    const payloadKey = payloadPayload.dataKey || payloadPayload.name
    if (config[payloadKey]) {
      configKey = payloadKey
    } else if (payloadPayload.payload?.[key] !== undefined) {
      configKey = payloadPayload.payload[key]
    }
  }

  return config[configKey]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}
