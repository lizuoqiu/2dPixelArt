import os
import unittest
import tempfile
from passing_api import app  # Import your Flask application

class FlaskTestCase(unittest.TestCase):

    def setUp(self):
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        app.config['TESTING'] = True
        self.app = app.test_client()
        # Other setup can go here

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])
        # Other teardown can go here

    def test_upload_file(self):
        with open('tests/sample_file.png', 'rb') as test_file:
            data = {
                'file': (test_file, 'sample_file.png')
            }
            response = self.app.post('/upload', data=data, content_type='multipart/form-data')
            self.assertEqual(response.status_code, 200)
            # You can add more assertions here to validate the response data

    # Add more tests as needed

if __name__ == '__main__':
    unittest.main()
