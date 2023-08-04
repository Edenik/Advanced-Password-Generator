import SaveIcon from '@mui/icons-material/SaveAs';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import { ContextMenuItem, useContextMenu } from "use-context-menu";
import "use-context-menu/styles.css";
import { useEnhancedTable } from '../hooks/useTable';
import { Column, Data, Order, getNestedPropertyValue } from '../utils/utils';
import { exportData } from '../utils/exportData';


interface EnhancedTableToolbarProps {
    numSelected: number;
    header?: JSX.Element;
    getSelectedRows: () => Data[];
}


function EnhancedTableToolbar({ numSelected, header, getSelectedRows }: EnhancedTableToolbarProps) {
    const {
        contextMenu,
        onContextMenu: onClick,
        onKeyDown,

    } = useContextMenu(
        <>
            <ContextMenuItem onSelect={() => { exportData(getSelectedRows(), 'txt') }}>Text file</ContextMenuItem>
            <ContextMenuItem onSelect={() => { exportData(getSelectedRows(), 'json') }}>JSON file</ContextMenuItem>
        </>,
        { alignTo: "auto-target" }
    );

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}>

            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (header)}

            {numSelected > 0 ? (
                <>
                    <Tooltip title="Export">
                        <IconButton onClick={onClick} onKeyDown={onKeyDown} >
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                    {contextMenu}
                </>
            ) : <></>}
        </Toolbar>
    );
}

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    columns: Column[];
}

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, columns }: EnhancedTableProps) {
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox" sx={{ width: '10px' }}>
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        width={column.width}
                        align={column.numeric ? 'right' : 'left'}
                        padding={column.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === column.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={createSortHandler(column.id)}
                        >
                            {column.label}
                            {orderBy === column.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}


const TableCellOverflow = styled(TableCell) <TableCellProps>`
  :last-of-type {
    max-width: 30vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface TableCellOverflowProps extends TableCellProps {
    canCopy?: boolean;
}
const TableCellOverflowWrapper = (props: TableCellOverflowProps) => {
    const { canCopy, ...otherProps } = props;

    const onCopy = React.useCallback(() => { navigator.clipboard.writeText((props.children ?? "") as string); }, [props.children])
    const { contextMenu, onContextMenu, onKeyDown } = useContextMenu(
        canCopy ?
            <ContextMenuItem onSelect={onCopy}>Copy password</ContextMenuItem> :
            <></>
    );

    return (
        <>
            <TableCellOverflow onContextMenu={onContextMenu} onKeyDown={onKeyDown} {...otherProps} />
            {contextMenu}
        </>
    );

}


export default function EnhancedTable({ rows, header, columns, loading }: { rows: Data[], header?: JSX.Element, columns: Column[], loading: boolean }) {
    const {
        order,
        orderBy,
        selected,
        page,
        dense,
        rowsPerPage,
        handleRequestSort,
        handleSelectAllClick,
        handleClick,
        handleChangePage,
        handleChangeRowsPerPage,
        isSelected,
        visibleRows,
        emptyRows,
        getSelectedRows
    } = useEnhancedTable(rows);

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar getSelectedRows={getSelectedRows} numSelected={selected.length} header={header} />
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: "80vh" }}>

                        <Table
                            stickyHeader
                            sx={{ minWidth: 750 }}
                            aria-labelledby="tableTitle"
                            size={dense ? 'small' : 'medium'}>

                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                                columns={columns} />


                            <TableBody>
                                {loading ?
                                    <TableRow sx={{ display: 'flex', height: '100px' }}>
                                        <Stack alignItems="center" sx={{ marginBlock: '3rem', position: 'absolute', left: '50%', height: '100px' }}>
                                            <CircularProgress />
                                        </Stack>
                                    </TableRow>
                                    :
                                    visibleRows.map((row, index) => {
                                        const isItemSelected = isSelected(row.id as string);
                                        const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow
                                                hover
                                                onClick={(event: React.MouseEvent<unknown, MouseEvent>) => handleClick(event, row.id as string)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={isItemSelected}
                                                sx={{ cursor: 'pointer' }}>

                                                <TableCellOverflow padding="checkbox" width='45px'>
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        inputProps={{
                                                            'aria-labelledby': labelId,
                                                        }} />
                                                </TableCellOverflow>

                                                {columns.map((column, index) => {
                                                    return <>
                                                        <TableCellOverflowWrapper
                                                            canCopy={column.canCopy}
                                                            width={column.width}
                                                            key={`${column.id}_${index}`}
                                                            component={index === 0 ? "th" : undefined}
                                                            id={index === 0 ? labelId : undefined}
                                                            scope={index === 0 ? "row" : undefined}
                                                            padding={index === 0 ? "none" : undefined}
                                                            align={index !== 0 ? "right" : undefined}>
                                                            {column.renderer ? column.renderer(row as Data) : getNestedPropertyValue(row, column.id) as string}
                                                        </TableCellOverflowWrapper>

                                                    </>
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: (dense ? 33 : 53) * emptyRows,
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100, 200, 500]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
