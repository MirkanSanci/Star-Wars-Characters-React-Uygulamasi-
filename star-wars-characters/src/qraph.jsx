import React, { useState } from 'react';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  gql,
  useQuery
} from '@apollo/client';
import Box from '@mui/system/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import ExcelJS from 'exceljs';
import TextField from '@mui/material/TextField'; 
import excelImage from './excel.png';
import starwarss from './starwarss.png';




const client = new ApolloClient({
  uri: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  cache: new InMemoryCache()
});

const GET_CHARACTERS = gql`
  query GetCharacters {
    allPeople {
      totalCount
      people {
        name
        gender
        eyeColor
      }
    }
  }
`;

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell>
          <TableSortLabel
            active={orderBy === 'name'}
            direction={orderBy === 'name' ? order : 'asc'}
            onClick={createSortHandler('name')}
          >
            Ad
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel
            active={orderBy === 'gender'}
            direction={orderBy === 'gender' ? order : 'asc'}
            onClick={createSortHandler('gender')}
          >
            Cinsiyet
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel
            active={orderBy === 'eyeColor'}
            direction={orderBy === 'eyeColor' ? order : 'asc'}
            onClick={createSortHandler('eyeColor')}
          >
            Göz Rengi
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function Characters() {
  const { loading, error, data } = useQuery(GET_CHARACTERS);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    eyeColor: ''
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event, filterKey) => {
    setFilters({ ...filters, [filterKey]: event.target.value });
  };

  const applyFilters = (character) => {
    return Object.keys(filters).every((filterKey) => {
      if (filters[filterKey] === '') return true;
      return character[filterKey].toLowerCase().includes(filters[filterKey].toLowerCase());
    });
  };

  const sortedAndFilteredData = stableSort(data.allPeople.people, getComparator(order, orderBy))
    .filter(applyFilters);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedAndFilteredData.length - page * rowsPerPage);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('StarWarsCharacters');

   
    worksheet.addRow(['Name', 'Gender', 'Eye Color']);

    
    sortedAndFilteredData.forEach((character) => {
      worksheet.addRow([character.name, character.gender, character.eyeColor]);
    });


    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StarWarsCharacters.xlsx';
    a.click();

   
    URL.revokeObjectURL(url);
  };

  return (
    <Paper>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
          <TextField
          size='small'
            label="Ad"
            variant="outlined"
            value={filters.name}
            onChange={(e) => handleFilterChange(e, 'name')}
          />
          <TextField
          size='small'
            label="Cinsiyet"
            variant="outlined"
            value={filters.gender}
            onChange={(e) => handleFilterChange(e, 'gender')}
          />
          <TextField
          size='small'
            label="Göz Rengi"
            variant="outlined"
            value={filters.eyeColor}
            onChange={(e) => handleFilterChange(e, 'eyeColor')}
          />
        </Box>
        <button style={{ border: "none", background: "none" }} onClick={exportToExcel}>
          <img src={excelImage} alt="" style={{ width: '60px', height: '50px' }} />
        </button>
      </Box>
      <TableContainer>
        <Table>
          <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((character, index) => (
              <TableRow key={index}>
                <TableCell>{character.name}</TableCell>
                <TableCell>{character.gender}</TableCell>
                <TableCell>{character.eyeColor}</TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 82]}
        component="div"
        count={sortedAndFilteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="div" gutterBottom>
          <img src={starwarss} alt="" style={{ width: '200px', height: '150px' }} />
          Characters
        </Typography>
        <Characters />
      </Box>
    </ApolloProvider>
  );
}

export default App;