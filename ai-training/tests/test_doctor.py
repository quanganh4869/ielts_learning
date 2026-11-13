"""Tests for Doctor preflight check module."""

import unittest
from ielts_ai.utils.doctor import check_nvidia_smi, check_system_ram_gb, get_disk_space_gb, run_doctor

class TestDoctor(unittest.TestCase):
    def test_check_system_ram(self):
        ram = check_system_ram_gb()
        self.assertGreater(ram, 0)

    def test_check_disk_space(self):
        disk = get_disk_space_gb()
        self.assertGreater(disk, 0)

    def test_run_doctor(self):
        report = run_doctor()
        self.assertIn("libraries", report)
        self.assertIn("gpu", report)
        self.assertIn("ram_gb", report)

if __name__ == "__main__":
    unittest.main()
