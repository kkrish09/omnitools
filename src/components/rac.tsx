import { forwardRef, type ReactNode } from 'react'
import {
  Button as AriaButton,
  TextField as AriaTextField,
  Input,
  TextArea,
  Label,
  FieldError,
  SearchField as AriaSearchField,
  Select as AriaSelect,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps,
  Checkbox as AriaCheckbox,
  Switch as AriaSwitch,
  Slider as AriaSlider,
  SliderTrack,
  SliderFill,
  SliderThumb,
  Meter as AriaMeter,
  Modal,
  Dialog,
  TooltipTrigger,
  Tooltip,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  Breadcrumbs as AriaBreadcrumbs,
  Breadcrumb,
  Separator,
  NumberField as AriaNumberField,
  RadioGroup as AriaRadioGroup,
  Radio,
  type RadioGroupProps,
  type TextFieldProps,
  type ButtonProps,
  type SearchFieldProps,
  type MeterProps,
  type SliderProps,
} from 'react-aria-components'
import { Copy, X } from 'lucide-react'
import { copyText } from '../lib/utils'

// ===== TOAST SYSTEM (simple implementation, no alpha) =====
let _toasts: { id: number; msg: string; desc?: string }[] = []
let _setToasts: React.Dispatch<React.SetStateAction<typeof _toasts>> | null = null
let _nextId = 0

export function showToast(msg: string, desc?: string) {
  const toast = { id: _nextId++, msg, desc }
  if (_setToasts) {
    _setToasts((prev) => [...prev, toast].slice(-3))
    setTimeout(() => {
      if (_setToasts) _setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 3000)
  }
}

export function ToastRegionWrapper() {
  // This will be rendered inside Layout - uses a simple state-based approach
  return null // Toasts use showToast which is called from event handlers
}

// ===== BUTTON =====
export const Button = forwardRef<HTMLButtonElement, ButtonProps & { variant?: string }>(
  ({ variant, children, ...props }, ref) => (
    <AriaButton ref={ref} data-variant={variant} {...props}>
      {children}
    </AriaButton>
  )
)
Button.displayName = 'Button'

// ===== COPY BUTTON =====
export function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  return (
    <TooltipTrigger>
      <Button
        data-variant="ghost"
        onPress={() => {
          copyText(text)
          showToast('Copied!', `${label} copied to clipboard`)
        }}
        className={className}
        aria-label={label}
      >
        <Copy size={14} />
        <span className="hidden sm:inline">{label}</span>
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  )
}

// ===== TEXT FIELD =====
export function TextField({ label, children, ...props }: TextFieldProps & { label?: string; children?: ReactNode }) {
  return (
    <AriaTextField {...props}>
      {label && <Label>{label}</Label>}
      {children || <Input />}
      <FieldError />
    </AriaTextField>
  )
}

// ===== SEARCH =====
export function SearchInput({ placeholder, value, onChange, onSubmit, ...props }: { placeholder?: string; value?: string; onChange?: (v: string) => void; onSubmit?: (v: string) => void; [k: string]: unknown }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onSubmit) onSubmit((e.target as HTMLInputElement).value) }}
        aria-label={props['aria-label'] as string}
        style={{
          width: '100%', padding: 'var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-10)',
          fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
          color: 'var(--text)', background: 'var(--bg-sunken)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          outline: 'none', transition: 'border-color 100ms ease, box-shadow 100ms ease',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-5)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-1)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

// ===== SELECT =====
export function SelectComponent<T extends object>(props: React.ComponentProps<typeof AriaSelect<T>> & { label?: string }) {
  return (
    <AriaSelect {...props}>
      {props.label && <Label>{props.label}</Label>}
      <AriaButton className="react-aria-SelectButton">
        <SelectValue />
      </AriaButton>
      <Popover>
        <ListBox>{props.children}</ListBox>
      </Popover>
    </AriaSelect>
  )
}

export { ListBoxItem as SelectItem }

// ===== TOGGLE BUTTON GROUP =====
export function ToggleGroup(props: ToggleButtonGroupProps) {
  return <AriaToggleButtonGroup {...props} />
}
export { AriaToggleButton as ToggleBtn }

// ===== TABS =====
export function TabContainer({ tabs, panels, label }: { tabs: { id: string; label: string }[]; panels: ReactNode[]; label?: string }) {
  return (
    <AriaTabs>
      <TabList aria-label={label}>
        {tabs.map((t) => <Tab key={t.id} id={t.id}>{t.label}</Tab>)}
      </TabList>
      <TabPanels>
        {panels.map((p, i) => <TabPanel key={tabs[i]!.id} id={tabs[i]!.id}>{p}</TabPanel>)}
      </TabPanels>
    </AriaTabs>
  )
}

// ===== CHECKBOX =====
export function Checkbox({ children, ...props }: { children?: ReactNode } & Omit<React.ComponentProps<typeof AriaCheckbox>, 'children'>) {
  return (
    <AriaCheckbox {...props}>
      <span className="react-aria-CheckboxBox" />
      {children}
    </AriaCheckbox>
  )
}

// ===== SWITCH =====
export function SwitchComponent({ label, children, ...props }: { children?: ReactNode; label?: string } & Omit<React.ComponentProps<typeof AriaSwitch>, 'children'>) {
  return (
    <AriaSwitch {...props} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
      <span className="react-aria-switch-track" style={{
        width: 40, height: 22, borderRadius: 11, position: 'relative',
        background: props.isSelected ? 'var(--accent-6)' : 'var(--gray-3)',
        transition: 'background 100ms ease', flexShrink: 0,
      }}>
        <span className="react-aria-switch-thumb" style={{
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: props.isSelected ? 21 : 3,
          transition: 'left 100ms ease', boxShadow: 'var(--shadow-sm)',
        }} />
      </span>
      {label || children}
    </AriaSwitch>
  )
}

// ===== SLIDER =====
export function SliderComponent({ label, ...props }: SliderProps & { label?: string }) {
  return (
    <AriaSlider {...props}>
      {label && <Label>{label}</Label>}
      <SliderTrack style={{ height: 6, background: 'var(--gray-3)', borderRadius: 9999, position: 'relative' }}>
        <SliderFill style={{ height: '100%', background: 'var(--accent-5)', borderRadius: 9999 }} />
        <SliderThumb style={{
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          border: '2px solid var(--accent-5)', boxShadow: 'var(--shadow-md)',
          cursor: 'grab', transition: 'box-shadow 100ms ease',
        }} />
      </SliderTrack>
    </AriaSlider>
  )
}

// ===== METER =====
export function MeterComponent({ label, value, maxValue = 100, valueLabel, ...props }: MeterProps & { label?: string }) {
  return (
    <AriaMeter value={value} maxValue={maxValue} {...props}>
      <div className="react-aria-MeterLabel" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--sp-1)' }}>
        <span>{label}</span>
        {valueLabel && <span>{valueLabel}</span>}
      </div>
      <div className="react-aria-MeterTrack" style={{ height: 8, background: 'var(--gray-2)', borderRadius: 9999, overflow: 'hidden' }}>
        <div className="react-aria-MeterFill" style={{ height: '100%', borderRadius: 9999, background: 'var(--accent-5)', transition: 'width 300ms ease', width: `${((value ?? 0) / maxValue) * 100}%` }} />
      </div>
    </AriaMeter>
  )
}

// ===== MODAL =====
export function UpsellModal({ isOpen, onOpenChange, title, description, children }: {
  isOpen: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children?: ReactNode
}) {
  return (
    <Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{description}</p>
        {children}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button slot="close" data-variant="ghost">Maybe later</Button>
          <Button slot="close" data-variant="primary" onPress={() => window.location.href = '/premium'}>Get Pro</Button>
        </div>
      </Dialog>
    </Modal>
  )
}

// ===== DISCLOSURE =====
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <AriaDisclosure>
      <button className="react-aria-DisclosureButton">
        <span>{question}</span>
        <span style={{ transition: 'transform 200ms ease', fontSize: '14px', color: 'var(--text-tertiary)' }}>›</span>
      </button>
      <DisclosurePanel>
        <p>{answer}</p>
      </DisclosurePanel>
    </AriaDisclosure>
  )
}

// ===== BREADCRUMBS =====
export function BreadcrumbNav({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <AriaBreadcrumbs>
      {items.map((item, i) => (
        <Breadcrumb key={i} data-current={!item.href} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
          {item.href ? (
            <a href={item.href} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{item.label}</a>
          ) : (
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.label}</span>
          )}
          {i < items.length - 1 && <span style={{ color: 'var(--text-tertiary)', margin: '0 var(--sp-1)' }}>›</span>}
        </Breadcrumb>
      ))}
    </AriaBreadcrumbs>
  )
}

// ===== SEPARATOR =====
export function Divider() {
  return <Separator style={{ border: 'none', height: 1, background: 'var(--border)', margin: 'var(--sp-4) 0' }} />
}
