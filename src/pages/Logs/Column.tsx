import type { Log } from '@/@types/parseable/api/query';
import { Box, Checkbox, Popover, Text, TextInput, UnstyledButton, px } from '@mantine/core';
import { type ChangeEvent, type FC, Fragment, useTransition, useRef, useCallback, useMemo } from 'react';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import useMountedState from '@/hooks/useMountedState';
import { useTableColumnStyle } from './styles';
import EmptyBox from '@/components/Empty';
import { Button } from '@mantine/core';
import Loading from '@/components/Loading';
import { FixedSizeList as List } from 'react-window';
import compare from 'just-compare';
import { parseLogData } from '@/utils';

type Column = {
	label: string;
	getColumnFilters: (columnName: string) => Log[number][] | null;
	appliedFilter: (columnName: string) => string[];
	applyFilter: (columnName: string, value: string[]) => void;
};

const Column: FC<Column> = (props) => {
	const { label, getColumnFilters, appliedFilter, applyFilter } = props;

	// columnValues ref will always have the unfiltered data.
	const _columnValuesRef = useRef<Log[number][] | null>(null);

	const [columnValues, setColumnValues] = useMountedState<Log[number][] | null>(null);
	const [selectedFilters, setSelectedFilters] = useMountedState<string[]>(appliedFilter(label));
	const [isPending, startTransition] = useTransition();

	const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
		const search = e.target.value.trim();

		setColumnValues(() => {
			const values = _columnValuesRef.current;

			if (values && search) {
				return values.filter((x) => {
					return parseLogData(x)?.toString().includes(search);
				});
			}

			return values;
		});
	};

	const setFilters = (filters: string[]) => {
		setSelectedFilters(filters);
	};

	const onOpen = useCallback(() => {
		if (!_columnValuesRef.current) {
			_columnValuesRef.current = getColumnFilters(label);
			startTransition(() => {
				setColumnValues(_columnValuesRef.current);
			});
		}
	}, []);

	const onApply = () => {
		applyFilter(label, selectedFilters);
	};

	const filterActive = useMemo(() => !!appliedFilter(label)?.length, [selectedFilters]);
	const canApply = useMemo(() => !compare(selectedFilters, appliedFilter(label)), [selectedFilters]);

	const { classes, cx } = useTableColumnStyle();
	const { labelBtn, applyBtn, labelIcon, labelIconActive, searchInputStyle } = classes;

	return (
		<th>
			<Popover position="bottom" withArrow withinPortal shadow="md" zIndex={1} onOpen={onOpen}>
				<Popover.Target>
					<UnstyledButton className={labelBtn}>
						<span className="label">{label}</span>
						<IconFilter
							stroke={filterActive ? 3 : 1.8}
							size={px('1rem')}
							className={cx(labelIcon, {
								[labelIconActive]: filterActive,
							})}
						/>
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<Box>
						<Text mb="xs">Filter by values:</Text>
						<TextInput
							className={searchInputStyle}
							placeholder="Search"
							icon={<IconSearch size={px('0.8rem')} />}
							onChange={onSearch}
						/>
						{isPending ? (
							<Loading visible position="relative" variant="oval" my="xl" />
						) : (
							<Fragment>
								{columnValues?.length ? (
									<Fragment>
										<CheckboxVirtualList
											list={columnValues}
											selectedFilters={selectedFilters}
											setFilters={setFilters}
										/>
										<Button className={applyBtn} onClick={onApply} disabled={!canApply}>
											Apply
										</Button>
									</Fragment>
								) : (
									<EmptyBox mb="lg" />
								)}
							</Fragment>
						)}
					</Box>
				</Popover.Dropdown>
			</Popover>
		</th>
	);
};

type CheckboxVirtualListProps = {
	list: Log[number][];
	selectedFilters: string[];
	setFilters: (value: string[]) => void;
};

const CheckboxVirtualList: FC<CheckboxVirtualListProps> = (props) => {
	const { list, selectedFilters, setFilters } = props;

	const { classes } = useTableColumnStyle();
	const { checkBoxStyle } = classes;

	return (
		<Checkbox.Group value={selectedFilters} onChange={setFilters}>
			<List itemCount={list.length} itemSize={35} height={250} width={250} overscanCount={10}>
				{({ index, style }) => {
					const label = list[index]?.toString() || '';

					return (
						<div style={style} title={label}>
							<Checkbox key={index} value={label} label={parseLogData(label)} className={checkBoxStyle} />
						</div>
					);
				}}
			</List>
		</Checkbox.Group>
	);
};

export default Column;
