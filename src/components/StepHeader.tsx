const steps = ['Tus datos', 'Día y hora', 'Pago', 'Revisar'];
export function StepHeader({current}: {current: number}) {return <ol className="step-header">{steps.map((label, index) => <li className={index + 1 === current ? 'is-active' : ''} key={label} aria-current={index + 1 === current ? 'step' : undefined}><span>{index + 1}</span>{label}</li>)}</ol>}
