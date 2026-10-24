export function SortSelect({value, options}: {value: string; options: {value: string; label: string}[]}) {
  return <label className="sort-control"><span>Ordenar</span><select name="orden" defaultValue={value}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
