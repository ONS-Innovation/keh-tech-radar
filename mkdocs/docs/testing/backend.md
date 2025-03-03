# Backend Testing

The backend testing suite validates the API endpoints that serve data to the Digital Landscape application. These tests ensure that the backend correctly processes requests, applies filters, and returns properly structured data.

## Test Implementation

The backend tests are implemented in `testing/backend/test_main.py` using the pytest framework and the requests library to make HTTP calls to the API endpoints.

### Base Configuration

All tests use a common base URL configuration:

```python
BASE_URL = "http://localhost:5001"
```

### Health Check Tests

The health check endpoint test verifies that the server is operational and returns basic health metrics:

```python
def test_health_check():
    """Test the health check endpoint functionality."""
    response = requests.get(f"{BASE_URL}/api/health", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "uptime" in data
    assert "memory" in data
    assert "pid" in data
```

### Project Data Tests

The CSV endpoint test verifies that project data is correctly retrieved and formatted:

```python
def test_csv_endpoint():
    """Test the CSV data endpoint functionality."""
    response = requests.get(f"{BASE_URL}/api/csv", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first_item = data[0]
        assert isinstance(first_item, dict)
        assert len(first_item.keys()) > 1
```

### Tech Radar Data Tests

The Tech Radar JSON endpoint test verifies that the radar configuration data is correctly retrieved:

```python
def test_tech_radar_json_endpoint():
    """Test the tech radar JSON endpoint functionality."""
    response = requests.get(f"{BASE_URL}/api/tech-radar/json", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data.keys()) > 1
```

### Repository Statistics Tests

#### Basic Statistics

Tests the default behavior with no filters:

```python
def test_json_endpoint_no_params():
    """Test the JSON endpoint without query parameters."""
    response = requests.get(f"{BASE_URL}/api/json", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "language_statistics" in data
    assert "metadata" in data
```

#### Date Filtering

Tests filtering repositories by a specific date:

```python
def test_json_endpoint_with_datetime():
    """Test the JSON endpoint with datetime filtering."""
    seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
    response = requests.get(
        f"{BASE_URL}/api/json", 
        params={"datetime": seven_days_ago}, 
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["filter_date"] == seven_days_ago
```

#### Archived Status Filtering

Tests filtering repositories by archived status:

```python
def test_json_endpoint_with_archived():
    """Test the JSON endpoint with archived status filtering."""
    response = requests.get(
        f"{BASE_URL}/api/json", 
        params={"archived": "true"}, 
        timeout=10
    )
    assert response.status_code == 200

    response = requests.get(
        f"{BASE_URL}/api/json", 
        params={"archived": "false"}, 
        timeout=10
    )
    assert response.status_code == 200
```

#### Combined Filtering

Tests applying multiple filters simultaneously:

```python
def test_json_endpoint_combined_params():
    """Test the JSON endpoint with multiple filter parameters."""
    seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
    params = {
        "datetime": seven_days_ago,
        "archived": "false"
    }
    response = requests.get(f"{BASE_URL}/api/json", params=params, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["filter_date"] == seven_days_ago
```

### Repository Project Tests

#### Error Handling

Tests the endpoint's response when required parameters are missing:

```python
def test_repository_project_json_no_params():
    """Test the repository project JSON endpoint error handling for missing parameters."""
    response = requests.get(f"{BASE_URL}/api/repository/project/json", timeout=10)
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert data["error"] == "No repositories specified"
```

#### Single Repository

Tests retrieving data for a single repository:

```python
def test_repository_project_json_with_repos():
    """Test the repository project JSON endpoint with a valid repository parameter."""
    response = requests.get(
        f"{BASE_URL}/api/repository/project/json", 
        params={"repositories": "tech-radar"}, 
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert "repositories" in data
    assert "stats" in data
    assert "language_statistics" in data
    assert "metadata" in data
```

#### Multiple Repositories

Tests retrieving data for multiple repositories:

```python
def test_repository_project_json_multiple_repos():
    """Test the repository project JSON endpoint with multiple repositories."""
    response = requests.get(
        f"{BASE_URL}/api/repository/project/json", 
        params={"repositories": "tech-radar,another-repo"}, 
        timeout=10
    )
    assert response.status_code == 200
    data = response.json()
    
    # Verify metadata contains both requested repositories
    metadata = data["metadata"]
    assert metadata["requested_repos"] == ["tech-radar", "another-repo"]
```

### Tech Radar Update Tests

#### Valid Structure

Tests updating the Tech Radar with valid data:

```python
def test_tech_radar_update_valid_structure():
    """Test the tech radar update endpoint with valid structure."""
    # Test implementation with sample valid data structure
    # This would include a POST request with a properly formatted Tech Radar entry
```

#### Invalid Structure

Tests the endpoint's handling of invalid data structures:

```python
def test_tech_radar_update_invalid_structure():
    """Test the tech radar update endpoint with invalid structure."""
    # Test implementation with sample invalid data structure
    # This would verify proper error handling and validation
```

## Error Handling Tests

### Invalid Endpoints

Tests the server's response to non-existent endpoints:

```python
def test_invalid_endpoint():
    """Test error handling for invalid endpoints."""
    response = requests.get(f"{BASE_URL}/api/nonexistent", timeout=10)
    assert response.status_code in [404, 500]  # Either is acceptable
```

### Invalid Parameters

Tests the server's handling of invalid parameter values:

```python
def test_json_endpoint_invalid_date():
    """Test the JSON endpoint's handling of invalid date parameters."""
    response = requests.get(
        f"{BASE_URL}/api/json", 
        params={"datetime": "invalid-date"}, 
        timeout=10
    )
    assert response.status_code == 200  # Backend handles invalid dates gracefully
    data = response.json()
    assert data["metadata"]["filter_date"] is None
```

## Test Execution Flow

The backend tests follow this general execution flow:

1. **Setup**: Configure the test environment and parameters
2. **Request**: Make an HTTP request to the target endpoint
3. **Validation**: Assert that the response status code is as expected
4. **Data Verification**: Assert that the response data structure is correct
5. **Content Verification**: Assert that the response data contains the expected values

## Integration with Frontend Utilities

These backend tests validate the same endpoints that are used by the frontend utilities:

1. **Project Data Utility**: The `test_csv_endpoint()` test validates the endpoint used by `fetchCSVFromS3()`
2. **Repository Data Utility**: The repository project tests validate the endpoint used by `fetchRepositoryData()`
3. **Tech Radar Data Utility**: The `test_tech_radar_json_endpoint()` test validates the endpoint used by `fetchTechRadarJSONFromS3()` 