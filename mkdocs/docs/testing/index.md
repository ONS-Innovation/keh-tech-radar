# Testing Documentation

The Digital Landscape application uses Python with pytest for backend testing. Frontend testing is not yet implemented.

## Testing Architecture

The testing framework is built using Python with pytest and follows these key principles:

- **Isolated Tests**: Each test function validates a specific endpoint or functionality
- **Comprehensive Coverage**: Tests cover all API endpoints and their various parameters
- **Clear Documentation**: Each test includes detailed docstrings explaining purpose and expectations
- **Error Handling Validation**: Tests verify proper error responses for invalid inputs

## Test Setup

### Prerequisites

- Python 3.8 or higher
- Make (for using Makefile commands)
- Backend server running on localhost:5001

### Installation

```bash
# Navigate to the testing directory
cd testing

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
make setup
```

## Running Tests

The testing framework provides several commands for running tests:

```bash
# Run all tests
make test

# Run a specific test
python3 -m pytest backend/test_main.py::test_name -v

# Example: Run only the health check test
python3 -m pytest backend/test_main.py::test_health_check -v
```

## Test Categories

The test suite covers the following API endpoints:

### Health Check Endpoint

Tests the `/api/health` endpoint to verify server status and health metrics.

```python
def test_health_check():
    """Test the health check endpoint functionality."""
    # Test implementation
```

### Project Data Endpoint

Tests the `/api/csv` endpoint that provides project data from CSV sources.

```python
def test_csv_endpoint():
    """Test the CSV data endpoint functionality."""
    # Test implementation
```

### Tech Radar Data Endpoint

Tests the `/api/tech-radar/json` endpoint that provides Tech Radar configuration data.

```python
def test_tech_radar_json_endpoint():
    """Test the tech radar JSON endpoint functionality."""
    # Test implementation
```

### Repository Statistics Endpoints

Tests the `/api/json` endpoint with various filtering parameters:

- No parameters (default behavior)
- Date filtering
- Archived status filtering
- Combined parameter filtering
- Invalid parameter handling

```python
def test_json_endpoint_no_params():
    """Test the JSON endpoint without query parameters."""
    # Test implementation

def test_json_endpoint_with_datetime():
    """Test the JSON endpoint with datetime filtering."""
    # Test implementation
```

### Repository Project Endpoints

Tests the `/api/repository/project/json` endpoint with various parameters:

- Missing parameters (error handling)
- Single repository filtering
- Multiple repository filtering
- Date filtering
- Archived status filtering
- Combined parameter filtering
- Language statistics validation

```python
def test_repository_project_json_with_repos():
    """Test the repository project JSON endpoint with a valid repository parameter."""
    # Test implementation

def test_repository_project_json_multiple_repos():
    """Test the repository project JSON endpoint with multiple repositories."""
    # Test implementation
```

### Tech Radar Update Endpoints

Tests the endpoints for updating Tech Radar data:

- Empty update handling
- Partial updates
- Invalid entry handling
- Structure validation
- Reference validation

```python
def test_tech_radar_update_valid_structure():
    """Test the tech radar update endpoint with valid structure."""
    # Test implementation
```

## Error Handling Tests

The test suite includes specific tests for error conditions:

- Invalid endpoints
- Invalid date parameters
- Missing required parameters
- Invalid data structures

```python
def test_invalid_endpoint():
    """Test error handling for invalid endpoints."""
    # Test implementation

def test_json_endpoint_invalid_date():
    """Test the JSON endpoint's handling of invalid date parameters."""
    # Test implementation
```

## Code Quality

The testing framework includes tools for maintaining code quality:

```bash
# Run linting checks
make lint

# Run specific linters
make ruff
make pylint

# Clean up cache files
make clean
```

## Integration with Utilities

The tests validate the same endpoints used by the frontend utilities:

- **Project Data Utility**: Tests the `/api/csv` endpoint used by `fetchCSVFromS3()`
- **Repository Data Utility**: Tests the `/api/repository/project/json` endpoint used by `fetchRepositoryData()`
- **Tech Radar Data Utility**: Tests the `/api/tech-radar/json` endpoint used by `fetchTechRadarJSONFromS3()`

This ensures that the data providers for the DataContext are functioning correctly and returning the expected data structures.
