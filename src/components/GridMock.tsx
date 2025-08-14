import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Skeleton,
  SkeletonItem,
  makeStyles,
} from '@fluentui/react-components';

// --- Styling using makeStyles (Fluent UI v9 approach) ---
// This is the recommended way to apply custom styles in Fluent UI v9.
const useStyles = makeStyles({
  root: {
    padding: '32px',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow:
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '16px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
  },
});

// --- Mock Data ---
// This is the data that will be displayed in the table after the loader.
const mockItems = [
  {
    key: '1',
    name: 'Project Athena',
    owner: 'John Doe',
    status: 'In Progress',
    lastModified: '2024-07-30',
  },
  {
    key: '2',
    name: 'Project Apollo',
    owner: 'Jane Smith',
    status: 'Completed',
    lastModified: '2024-07-28',
  },
  {
    key: '3',
    name: 'Project Zeus',
    owner: 'Peter Jones',
    status: 'On Hold',
    lastModified: '2024-07-25',
  },
  {
    key: '4',
    name: 'Project Hera',
    owner: 'Mary Johnson',
    status: 'Not Started',
    lastModified: '2024-07-29',
  },
  {
    key: '5',
    name: 'Project Poseidon',
    owner: 'Chris Lee',
    status: 'In Progress',
    lastModified: '2024-07-31',
  },
];

// --- Column Definitions for the Header ---
const columns = [
  { columnKey: 'name', label: 'Project Name' },
  { columnKey: 'owner', label: 'Owner' },
  { columnKey: 'status', label: 'Status' },
  { columnKey: 'lastModified', label: 'Last Modified' },
];

// --- Loading Skeleton Component ---
// A dedicated component to show while data is loading.
const TableSkeleton = () => {
  const styles = useStyles();
  return (
    <div className={styles.table}>
      <Skeleton>
        {/* We create a few skeleton rows to mimic the table structure */}
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <SkeletonItem style={{ width: '100%', height: '20px' }} />
          </div>
        ))}
      </Skeleton>
    </div>
  );
};

const GridMock = () => {
  // State to manage the loading status
  const [isLoading, setIsLoading] = useState(true);
  const styles = useStyles();

  // Effect to simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.root}>
      <h1 className={styles.header}>Projects</h1>
      <div className={styles.container}>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <Table aria-label='Project data table' className={styles.table}>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHeaderCell key={column.columnKey}>
                    <b>{column.label}</b>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockItems.map(item => (
                <TableRow key={item.key}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.lastModified}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default GridMock;
