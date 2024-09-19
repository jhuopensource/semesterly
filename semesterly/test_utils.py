# Copyright (C) 2017 Semester.ly Technologies, LLC
#
# Semester.ly is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Semester.ly is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

import datetime
import inspect
import itertools
import os
import re
import shutil
import socket
import time
from contextlib import contextmanager
from importlib import import_module

from django.contrib.auth import BACKEND_SESSION_KEY
from django.contrib.auth import HASH_SESSION_KEY
from django.contrib.auth import SESSION_KEY
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.remote.webelement import WebElement
from webdriver_manager.chrome import ChromeDriverManager
from social_django.models import UserSocialAuth

from student.models import PersonalTimetable
from student.models import Student
from timetable.models import Course
from timetable.models import Offering
from timetable.models import Section
from timetable.models import Semester
from timetable.utils import get_current_semesters


class SeleniumTestCase(StaticLiveServerTestCase):
    """
    This test case extends the Django StaticLiveServerTestCase.
    It creates a selenium ChromeDriver instance on setUp of each
    test. It navigates to the live url for the static live server.
    It also provides utilities and assertions for navigating and
    testing presence of elements or behavior.

    Attributes:
        img_dir (str): Directory to save screenshots on failure.

        driver (WebDriver): Chrome WebDriver instance.

        timeout (int): Socket default timeout.

    """

    serialized_rollback = True

    def __init__(self, *args, **kwargs):
        super(SeleniumTestCase, self).__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        super(SeleniumTestCase, cls).setUpClass()
        cls.TIMEOUT = 10
        cls.chrome_options = webdriver.ChromeOptions()
        cls.chrome_options.add_experimental_option(
            "prefs", {"profile.default_content_setting_values.notifications": 2}
        )
        cls.chrome_options.add_argument(
            "--no-sandbox"
        )  # Allow running chrome as root in Docker
        cls.chrome_options.add_argument("--headless")  # Do not require a display
        cls.chrome_options.add_argument("--disable-dev-shm-usage")  # for docker
        cls.chrome_options.add_argument("--window-size=1920x1080")

    def setUp(self):
        self.img_dir = os.path.dirname(os.path.realpath(__file__)) + "/test_failures"
        self.init_screenshot_dir()
        self.driver = webdriver.Chrome(
            ChromeDriverManager().install(), options=self.chrome_options
        )
        sem = get_current_semesters("jhu")[0]
        sem, _ = Semester.objects.update_or_create(name=sem["name"], year=sem["year"])
        for section in Section.objects.filter(
            semester__name="Fall", semester__year=2022
        ):
            section.semester = sem
            section.save()
        self.current_sem = sem
        self.driver.get(self.get_test_url("jhu"))
        WebDriverWait(self.driver, self.TIMEOUT).until(
            lambda driver: driver.find_element(By.TAG_NAME, "body")
        )

    def tearDown(self):
        self.driver.quit()

    def init_screenshot_dir(self):
        """Initializes directory to which we store test failure screenshots"""
        if os.path.exists(self.img_dir):
            shutil.rmtree(self.img_dir)
        os.makedirs(self.img_dir)

    def screenshot(self, name):
        self.driver.save_screenshot(f"{self.img_dir}/{name}.png")

    @contextmanager
    def description(self, descr):
        """A context manager which wraps a group of code and adds details to any exceptions thrown
        by the enclosed lines. Upon such an exception, the context manager will also take a screenshot
        of the current state of self.driver, writing a PNG to self.img_dir, labeled by the provided
        description and a timetstamp.
        """
        socket.setdefaulttimeout(10 * self.TIMEOUT)
        try:
            yield
        except Exception as exc:
            filename = self.img_dir + "/%s%s.png" % (descr, datetime.datetime.now())
            msg = "\n" + "=" * 70 + "\n"
            msg += "FAILED TEST CASE: '%s'\n" % descr
            msg += "SCREENSHOT MAY BE FOUND IN: %s\n" % self.img_dir
            msg += "" + "-" * 70 + "\n"
            self.driver.save_screenshot(filename)
            trace = ["\n\nFull Traceback (most recent call last):"]
            for item in inspect.trace():
                trace.append(' File "{1}", line {2}, in {3}'.format(*item))
                for line in item[4]:
                    trace.append(" " + line.strip())
            raise type(exc)(str(exc) + "\n".join(trace) + msg)

    def get_test_url(self, school, path=""):
        """Get's the live server testing url for a given school.

        Args:
            school (str): the string for which to create the test url
            path (str): the appended path to file or page with trailing /

        Returns:
            the testing url
        """
        url = "%s%s" % (self.live_server_url, "/")
        url = url.replace("http://", "http://%s." % school)
        return url.replace("localhost", "sem.ly") + path

    def find(
        self, locator, get_all=False, root=None, clickable=False, hidden=False
    ) -> "WebElement | list[WebElement]":
        """Locates element in the DOM and returns it when found.

        Args:
            locator: A tuple of (By.*, 'indentifier')
            get_all (bool, optional): If true, will return list of matching elements
            root (bool, optional): The root element to search from, root of DOM if None
            clickable (bool, optional): If true, waits for clickability of element
            hidden (bool, optional): If true, will allow for hidden elements

        Returns:
           The WebElement object returned by self.driver (Selenium)

        Throws:
            RuntimeError: If element is not found or both get_all and clickable is True
        """
        if get_all and clickable:
            raise RuntimeError("Cannot use both get_all and clickable")
        elif get_all:
            condition = EC.presence_of_all_elements_located(locator)
        elif clickable:
            condition = EC.element_to_be_clickable(locator)
        elif hidden:
            condition = EC.presence_of_element_located(locator)
        else:
            condition = EC.visibility_of_element_located(locator)
        try:
            return WebDriverWait(root if root else self.driver, self.TIMEOUT).until(
                condition
            )
        except TimeoutException:
            raise RuntimeError(
                'Failed to locate visible element "%s" by %s' % locator[::-1]
            )

    def assert_timetable_not_found(self, name):
        timetable_dropdown = self.find((By.CLASS_NAME, "timetable-drop-it-down"))
        timetable_dropdown.click()

        try:
            row = self.find(
                (By.XPATH, "//div[@class='tt-name' and contains(text(),'%s')]" % name)
            )
        except RuntimeError:
            return True

        raise RuntimeError("Timetable found")

    def assert_invisibility(self, locator, root=None):
        """Asserts the invisibility of the provided element

        Args:
            locator: A tuple of (By.*, 'indentifier')
            root (bool, optional): The root element to search from, root of DOM if None
        """
        try:
            WebDriverWait(root if root else self.driver, self.TIMEOUT).until(
                EC.invisibility_of_element_located(locator)
            )
        except TimeoutException:
            raise RuntimeError(
                'Failed to assert invisibility of element "%s" by %s' % locator[::-1]
            )

    def clear_tutorial(self):
        """Clears the tutorial modal for first time users"""
        for _ in range(4):
            arrow = self.find(
                (
                    By.XPATH,
                    (
                        '//div[@class="tut-modal__nav"]'
                        '/i[@class="action fa fa-chevron-right"] |'
                        '//div[@class="tut-modal__nav"]/h4'
                    ),
                ),
                clickable=True,
            )
            arrow.click()
        self.assert_invisibility((By.XPATH, '//div[@class="tut-modal__nav"]'))

    def enter_search_query(self, query):
        """Enters the provided query into the search box"""
        search_box = self.find(
            (By.XPATH, '//div[@class="search-bar__input-wrapper"]/input')
        )
        search_box.clear()
        search_box.send_keys(query)
        try:
            self.find((By.CLASS_NAME, "results-loading-gif"))
        except RuntimeError:
            pass  # wait for debounce, but ignore if didn't happen
        self.assert_invisibility((By.CLASS_NAME, "results-loading-gif"))

    def clear_search_query(self):
        """Clears the search box"""
        search_box = self.find(
            (By.XPATH, '//div[@class="search-bar__input-wrapper"]/input')
        )
        search_box.clear()
        self.assert_n_elements_found((By.CLASS_NAME, "search-course"), 0)

    def assert_loader_completes(self):
        """Asserts that the semester.ly page loader has completed"""
        self.assert_invisibility((By.CLASS_NAME, "la-ball-clip-rotate-multiple"))

    def assert_slot_presence(self, n_slots, n_master_slots):
        """Assert n_slots and n_master_slots are on the page"""
        slots = self.find((By.CLASS_NAME, "slot"), get_all=True)
        self.assertEqual(len(slots), n_slots)
        master_slots = self.find((By.CLASS_NAME, "master-slot"), get_all=True)
        self.assertEqual(len(master_slots), n_master_slots)

    def search_course(self, query, n_results):
        """Searches a course and asserts n_results elements are found

        Args:
            query (str): the text to enter into search
            n_results (int): the number of results to look for. If 0, will look for no
                results
        """
        self.enter_search_query(query)
        if n_results > 0:
            search_results = self.find((By.CLASS_NAME, "search-results"))
            self.assert_n_elements_found((By.CLASS_NAME, "search-course"), n_results)
        else:
            self.assert_invisibility((By.CLASS_NAME, "search-results"))

    def search_infinite_scroll(self, n):
        """Scrolls down the search results and asserts n elements are found"""
        search_results_container = self.find(
            (By.CLASS_NAME, "search-results__list-container")
        )
        self.driver.execute_script(
            "arguments[0].scrollTo(0, arguments[0].scrollHeight)",
            search_results_container,
        )

        if n > 0:
            self.assert_n_elements_found((By.CLASS_NAME, "search-course"), n)
        else:
            self.assert_invisibility((By.CLASS_NAME, "search-results"))

    def add_course(self, course_idx, n_slots, n_master_slots, by_section="", code=None):
        """Adds a course via search results and asserts the corresponding number of slots are found

        Args:
            course_idx (int): index into the search results corresponding the to course to add
            n_slots (int): the number of slots expected after add
            n_master_slots (int): the number of master slots expected after add
            by_section (str, optional): if provided adds the specific section of the course
            code (str, optional): the course code to add, validates presence if provided
        """
        # Focus the search box
        search_box = self.find(
            (By.XPATH, '//div[@class="search-bar__input-wrapper"]/input')
        )
        search_box.send_keys("")
        search_results = self.find((By.CLASS_NAME, "search-results"))
        if code:
            chosen_course = WebDriverWait(self.driver, self.TIMEOUT).until(
                text_to_be_present_in_nth_element(
                    (By.CLASS_NAME, "search-course"), code, course_idx
                )
            )
        else:
            chosen_course = search_results.find_elements(
                by=By.CLASS_NAME, value="search-course"
            )[course_idx]
        if not by_section:
            add_button = self.find(
                (By.CLASS_NAME, "search-course-add"), root=chosen_course, clickable=True
            )
            add_button.click()
        else:
            ActionChains(self.driver).move_to_element(chosen_course).perform()
            # ensure that the side bar is visible
            self.find((By.CLASS_NAME, "search-bar__side"))
            section = self.find(
                (
                    By.XPATH,
                    "//h5[contains(@class,'sb-side-sections') and "
                    + "contains(text(),'%s')]" % by_section,
                ),
                clickable=True,
            )
            ActionChains(self.driver).move_to_element(chosen_course).move_to_element(
                section
            ).click().perform()
        self.assert_loader_completes()
        self.assert_slot_presence(n_slots, n_master_slots)
        self.click_off()

    def assert_visibility(self, locator, root=None):
        self.assert_n_elements_found(locator, 1, root=root)

    def assert_n_elements_found(self, locator, n_elements, root=None):
        """Asserts that n_elements are found by the provided locator"""
        if n_elements == 0:
            self.assert_invisibility(locator)
        else:
            WebDriverWait(self.driver, self.TIMEOUT).until(
                n_elements_to_be_found(locator, n_elements)
            )

    def remove_course(self, course_idx, from_slot=False, n_slots_expected=None):
        """Removes a course from the user's timetable, asserts master slot is removed.

        Args:
            course_idx (int): the index of the course for which to remove
            from_slot (bool, optional): if provided, removes via slot rather than via a master_slot
            n_slots_expected (int, optional): if provided, asserts n slots found after removal
        """
        n_master_slots_before = len(
            self.find((By.CLASS_NAME, "master-slot"), get_all=True)
        )
        if from_slot:
            if n_master_slots_before > 1:
                raise RuntimeError("Cannot remove via slot button unless n_courses = 1")
            if n_master_slots_before == 0:
                raise RuntimeError("Cannot remove via slot button if no courses")
            slot = self.find((By.CLASS_NAME, "slot"), get_all=True)[0]
            ActionChains(self.driver).move_to_element(slot).pause(1).perform()
            del_button = self.find(
                (By.CLASS_NAME, "fa-times"), root=slot, clickable=True
            )
        else:
            master_slot = self.find((By.CLASS_NAME, "master-slot"), get_all=True)[
                course_idx
            ]
            del_button = self.find(
                (By.CLASS_NAME, "fa-times"), root=master_slot, clickable=True
            )
        del_button.click()
        self.assert_loader_completes()
        self.assert_n_elements_found(
            (By.CLASS_NAME, "master-slot"), n_master_slots_before - 1
        )
        if n_slots_expected:
            self.assert_n_elements_found((By.CLASS_NAME, "slot"), n_slots_expected)

    def delete_timetable(self, name):
        timetable_dropdown = self.find((By.CLASS_NAME, "timetable-drop-it-down"))
        timetable_dropdown.click()

        row = self.find(
            (By.XPATH, "//div[@class='tt-name' and contains(text(),'%s')]" % name)
        )
        del_button = self.find((By.CLASS_NAME, "fa-trash-o"), root=row, clickable=True)
        del_button.click()

        confirmation_btn = self.find(
            (By.CLASS_NAME, "delete-timetable-alert-btn"), clickable=True
        )
        confirmation_btn.click()

    def open_course_modal_from_search(self, course_idx):
        """Opens course modal from search by search result index"""
        search_results = self.find((By.CLASS_NAME, "search-results"))
        chosen_course = search_results.find_elements(
            by=By.CLASS_NAME, value="search-course"
        )[course_idx]
        chosen_course.click()
        self.assert_visibility((By.CLASS_NAME, "course-modal"))

    def validate_course_modal(self):
        """Validates the course modal displays proper course data"""
        url_match = WebDriverWait(self.driver, self.TIMEOUT).until(
            url_matches_regex(r"\/course\/(.*)\/(.*)\/(20..)")
        )
        code = url_match.group(1)
        semester = Semester.objects.get(
            name=url_match.group(2), year=url_match.group(3)
        )
        course = Course.objects.get(code=code)
        modal = self.find((By.CLASS_NAME, "course-modal"))
        self.validate_course_modal_body(course, modal, semester)

    def validate_course_modal_body(self, course, modal, semester):
        """Validates the course modal body displays credits, name, code, etc."""
        modal_body = self.find((By.CLASS_NAME, "modal-body"), root=modal)
        modal_header = self.find((By.CLASS_NAME, "modal-header"), root=modal)
        credit_count = self.find((By.CLASS_NAME, "credits"), root=modal_body)
        self.assertTrue(
            str(int(course.num_credits)) in credit_count.text
            or str(course.num_credits) in credit_count.text
        )
        self.assertTrue(course.name in modal_header.text)
        self.assertTrue(course.code in modal_header.text)
        self.assertTrue(course.prerequisites in modal_body.text)
        # self.assertTrue(course.areas in modal_body.text)
        # n_sections = Section.objects.filter(
        #     course=course,
        #     semester=semester
        # ).count()
        # WebDriverWait(self.driver, self.TIMEOUT) \
        #         .until(n_elements_to_be_found((By.CLASS_NAME, 'modal-section'), n_sections))

    def open_course_modal_from_slot(self, course_idx):
        """Opens the course modal from the nth slot"""
        slot = self.find((By.CLASS_NAME, "master-slot"), get_all=True)[course_idx]
        # For some reason, it was always clicking the share link instead of the slot
        ActionChains(self.driver).move_to_element(slot).move_by_offset(
            0, -10
        ).click().perform()
        self.assert_visibility((By.CLASS_NAME, "course-modal"))

    def close_course_modal(self):
        """Closes the course modal using the (x) button"""
        modal = self.find((By.CLASS_NAME, "course-modal"))
        modal_header = self.find((By.CLASS_NAME, "modal-header"), root=modal)
        self.find(
            (By.CLASS_NAME, "fa-times"), root=modal_header, clickable=True
        ).click()
        self.assert_invisibility((By.CLASS_NAME, "course-modal"))

    def follow_and_validate_url(self, url, validate):
        """Opens a new window, switches to it, gets the url and validates it
        using the provided validating function.

        Args:
            url (str): the url to follow and validate
            validate (func): the function which validates the new page
        """
        # Some versions of chrome don't like if url does not start with http
        if not str(url).startswith("http"):
            url = "%s%s" % ("http://", url)
        self.driver.execute_script("window.open()")
        self.driver.switch_to.window(self.driver.window_handles[1])
        self.driver.get(url)
        validate()
        self.driver.close()
        self.driver.switch_to.window(self.driver.window_handles[0])

    def follow_share_link_from_modal(self):
        modal = self.find((By.CLASS_NAME, "course-modal"))
        modal_header = self.find((By.CLASS_NAME, "modal-header"), root=modal)
        self.find((By.CLASS_NAME, "fa-share-alt"), root=modal_header).click()
        url = self.find(
            (By.CLASS_NAME, "share-course-link"), root=modal_header
        ).get_attribute("value")
        self.follow_and_validate_url(url, self.validate_course_modal)

    def follow_share_link_from_slot(self):
        """Click the share link on the slot and follow it then validate the course modal"""
        master_slot = self.find((By.CLASS_NAME, "master-slot"), clickable=True)
        share = self.find(
            (By.CLASS_NAME, "fa-share-alt"), root=master_slot, clickable=True
        )
        share.click()
        url = self.find(
            (By.CLASS_NAME, "share-course-link"), root=master_slot
        ).get_attribute("value")
        self.follow_and_validate_url(url, self.validate_course_modal)

    def remove_course_from_course_modal(self, n_slots_expected=None):
        """Removes course via the action within the course's course modal.
        Requires that the course modal be open.
        """
        n_master_slots_before = len(
            self.find((By.CLASS_NAME, "master-slot"), get_all=True)
        )
        modal = self.find((By.CLASS_NAME, "course-modal"))
        modal_header = self.find((By.CLASS_NAME, "modal-header"), root=modal)
        remove = self.find(
            (By.CLASS_NAME, "fa-check"), root=modal_header, clickable=True
        )
        remove.click()
        time.sleep(1)
        self.assert_loader_completes()
        self.assert_invisibility((By.CLASS_NAME, "course-modal"))
        self.assert_n_elements_found(
            (By.CLASS_NAME, "master-slot"), n_master_slots_before - 1
        )
        if n_slots_expected:
            self.assert_n_elements_found((By.CLASS_NAME, "slot"), n_slots_expected)

    def add_course_from_course_modal(self, n_slots, n_master_slots):
        """Adds a course via the course modal action.
        Requires that the course modal be open.
        """
        modal = self.find((By.CLASS_NAME, "course-modal"))
        modal_header = self.find((By.CLASS_NAME, "modal-header"), root=modal)
        url_match = WebDriverWait(self.driver, self.TIMEOUT).until(
            url_matches_regex(r"\/course\/(.*)\/(.*)\/(20..)")
        )
        course = Course.objects.get(code=url_match.group(1))
        self.find((By.CLASS_NAME, "fa-plus"), root=modal_header).click()
        self.assert_loader_completes()
        self.assert_invisibility((By.CLASS_NAME, "course-modal"))
        self.assert_slot_presence(n_slots, n_master_slots)
        return course

    def validate_timeable(self, courses):
        """Validate timetable by checking that for each course provided, a slot exists
        with that course's name and course code."""
        slots = self.find((By.CLASS_NAME, "slot"), get_all=True)
        for course in courses:
            any(
                [
                    course.name in slot.text and course.code in slot.text
                    for slot in slots
                ]
            )

    def share_timetable(self, courses):
        """Clicks the share button via the top bar and validates it.
        Validation is done by following the url and checking the timetable using
        the validate_timetable function
        """
        top_bar_actions = self.find((By.CLASS_NAME, "fc-right"))
        self.find(
            (By.CLASS_NAME, "fa-share-alt"), clickable=True, root=top_bar_actions
        ).click()
        url = self.find(
            (By.CLASS_NAME, "share-course-link"), root=top_bar_actions
        ).get_attribute("value")
        self.follow_and_validate_url(url, lambda: self.validate_timeable(courses))

    def click_off(self):
        """Clears the focus of the driver"""
        self.find((By.CLASS_NAME, "semesterly-name"), clickable=True).click()

    def lock_course(self):
        """Locks the first course on the timetable"""
        self.click_off()
        slot = self.find((By.CLASS_NAME, "slot"), clickable=True)
        ActionChains(self.driver).move_to_element(slot).perform()
        lock = self.find((By.CLASS_NAME, "fa-unlock"), root=slot, clickable=True)
        ActionChains(self.driver).move_to_element(slot).move_to_element(
            lock
        ).click().perform()
        for slot in self.find((By.CLASS_NAME, "slot"), get_all=True):
            self.find((By.CLASS_NAME, "fa-lock"), clickable=True)
        self.assert_invisibility((By.CLASS_NAME, "sem-pagination"))

    def execute_action_expect_alert(self, action, alert_text_contains=""):
        """Executes the provided action, asserts that an alert appears and validates
        that the alert text contains the provided string (when provided)"""
        action()
        alert = self.find(
            (By.XPATH, "//div[@class='react-alerts']//div[contains(@class,'alert')]")
        )
        self.assertTrue(alert_text_contains in alert.text)

    def take_alert_action(self):
        """Takes the action provided by the alert by clicking the button on when visible"""
        alert = self.find(
            (By.XPATH, "//div[@class='react-alerts']//div[contains(@class,'alert')]")
        )
        self.find(
            (By.CLASS_NAME, "conflict-alert-btn"),
            root=alert,
        ).click()

    def allow_conflicts_add(self, n_slots):
        """Allows conflicts via the conflict alert action,
        then validates that the course was added
        """
        n_master_slots_before = len(
            self.find((By.CLASS_NAME, "master-slot"), get_all=True)
        )
        self.take_alert_action()
        self.assert_loader_completes()
        self.assert_n_elements_found(
            (By.CLASS_NAME, "master-slot"), n_master_slots_before + 1
        )
        self.assert_n_elements_found((By.CLASS_NAME, "slot"), n_slots)

    def change_term(self, term, clear_alert=False):
        """Changes the term to the provided term by matching the string to the string
        found in the semester dropdown on Semester.ly"""
        self.click_off()
        self.find((By.CLASS_NAME, "search-bar__semester")).click()
        self.find(
            (
                By.XPATH,
                "//div[contains(@class,'semester-option') "
                + "and contains(text(),'%s')]" % term,
            ),
            clickable=True,
        ).click()
        if clear_alert:
            self.take_alert_action()
        search_box = self.find(
            (By.XPATH, '//div[@class="search-bar__input-wrapper"]/input')
        )
        search_box.clear()
        WebDriverWait(self.driver, self.TIMEOUT).until(
            text_to_be_present_in_element_attribute(
                (By.XPATH, '//div[@class="search-bar__input-wrapper"]/input'),
                term,
                "placeholder",
            )
        )

    def change_to_current_term(self, clear_alert=False):
        sem = get_current_semesters("jhu")[0]
        self.change_term("%s %s" % (sem["name"], sem["year"]), clear_alert=clear_alert)

    def open_and_query_adv_search(self, query, n_results=None):
        """Open's the advanced search modal and types in the provided query,
        asserting that n_results are then returned"""
        self.find((By.CLASS_NAME, "show-advanced-search"), clickable=True).click()
        self.find((By.CLASS_NAME, "advanced-search-modal"), clickable=True)
        search = self.find(
            (By.XPATH, '//div[contains(@class,"advanced-search-modal-header")]//input')
        )
        search.clear()
        search.send_keys(query)
        if n_results:
            self.assert_n_elements_found(
                (By.CLASS_NAME, "advanced-s-result"), n_results
            )

    def close_adv_search(self):
        """Closes the advanced search modal"""
        self.find((By.CLASS_NAME, "fa-times"), clickable=True).click()

    def login_via_fb(self, email, password):
        """Login user via fb by detecting the Continue with Facebook button in the
        signup modal, and then mocking user's credentials

        Args:
            email (str): User's email
            password (str): User's password
        """
        self.find((By.CLASS_NAME, "social-login"), clickable=True).click()
        self.find((By.CLASS_NAME, "fb-btn"), clickable=True)
        user = self.get_or_create_student(email, password).user
        social_user, _ = UserSocialAuth.objects.get_or_create(
            user=user,
            uid="12345678987654321",
            provider="facebook",
            extra_data={"access_token": "12345678987654321", "expires": "never"},
        )
        social_user.save()
        force_login(user, self.driver, self.get_test_url("jhu"))

    def login_via_google(self, email, password):
        """Mocks the login of a user via Google by detecting the Continue with Google
        button in the signup modal, and then mocking the user's credentials.

        Args:
            email (str): User's email
            password (str): User's password
        """
        self.find((By.CLASS_NAME, "social-login"), clickable=True).click()
        self.find(
            (
                By.XPATH,
                (
                    "//span[contains(text(), 'Continue with Google')]"
                    "/ancestor::button[contains(@class, 'btn')]"
                ),
            ),
            clickable=True,
        )
        user = self.get_or_create_student(email, password).user
        social_user, _ = UserSocialAuth.objects.get_or_create(
            user=user,
            uid="12345678987654321",
            provider="google-oauth2",
            extra_data={"access_token": "12345678987654321", "expires": "never"},
        )
        social_user.save()
        force_login(user, self.driver, self.get_test_url("jhu"))

    def get_or_create_student(self, email, password) -> Student:
        user, _ = User.objects.get_or_create(
            username="semlytestdev", email=email, password=password
        )
        student, _ = Student.objects.get_or_create(
            user=user,
            img_url=self.get_test_url("jhu", path="static/img/user2-160x160.jpg"),
        )
        user.save()
        student.save()
        return student

    def logout(self):
        self.find((By.CLASS_NAME, "social-pro-pic"), clickable=True).click()
        self.find((By.XPATH, "//a[@href='/user/logout/']"), clickable=True).click()

    def select_nth_adv_search_result(self, index, semester):
        """Selects the nth advanced search result with a click.
        Validates the course modal body displayed in the search reuslts"""
        res = self.find((By.CLASS_NAME, "advanced-s-result"), get_all=True)
        code = self.find((By.TAG_NAME, "h5"), root=res[index]).text
        course = Course.objects.get(code=code)
        ActionChains(self.driver).move_to_element(res[index]).click().perform()
        modal = self.find((By.CLASS_NAME, "adv-modal"))
        self.validate_course_modal_body(course, modal, semester)

    def save_user_settings(self):
        """Saves user setttings by clicking the button, asserts that the
        modal is then invisible"""
        self.find((By.CLASS_NAME, "signup-button")).click()
        self.assert_invisibility((By.CLASS_NAME, "user-settings-modal"))

    def complete_user_settings_basics(self, major, class_year):
        """Completes major/class year/TOS agreement via the user settings modal

        Args:
            major (str): Student's major
            class_year (str): Student's class year
        """
        # Assert that user settings modal is open
        self.find((By.CLASS_NAME, "user-settings-modal"))
        major_select, year_select = self.find(
            (By.XPATH, "//div[contains(@class,'select-field')]//input"),
            get_all=True,
            hidden=True,
        )
        major_select.send_keys(major)
        self.find((By.XPATH, f"//div[contains(text(), '{major}')]")).click()
        year_select.send_keys(class_year)
        ActionChains(self.driver).move_to_element(year_select).move_by_offset(
            0, year_select.size["height"] + 20
        ).click().perform()

        self.find(
            (
                By.XPATH,
                "//span[contains(@class, 'switch-label') and contains(@data-off, 'CLICK TO ACCEPT')]",
            )
        ).click()
        self.save_user_settings()
        self.assert_invisibility((By.CLASS_NAME, "user-settings-modal"))

    def change_ptt_name(self, name):
        """Changes personal timetable name to the provided title"""
        name_input = self.find((By.CLASS_NAME, "timetable-name"))
        ActionChains(self.driver).click(name_input).double_click(name_input).perform()
        name_input.send_keys(Keys.DELETE, name)
        self.click_off()

    def assert_ptt_const_across_refresh(self):
        """Refreshes the browser and asserts that the tuple
        version of the personal timetable is equivalent to pre-refresh
        """
        self.assert_invisibility((By.CLASS_NAME, "unsaved"))
        ptt = self.ptt_to_tuple()
        self.driver.refresh()
        self.assert_ptt_equals(ptt)

    def assert_ptt_equals(self, ptt):
        """Asserts equivalency between the provided ptt tuple and the current ptt"""
        try:
            WebDriverWait(self.driver, self.TIMEOUT).until(
                function_returns_true(lambda: self.ptt_equals(ptt))
            )
        except TimeoutException:
            # ptt equivalency check failed. Run check one final time for useful debug info
            self.ptt_equals(ptt)
            raise RuntimeError("PTTs are not equal.")

    def ptt_equals(self, ptt):
        slots, master_slots, tt_name = ptt
        self.assertCountEqual(slots, self.get_elements_as_text((By.CLASS_NAME, "slot")))
        self.assertCountEqual(
            master_slots, self.get_elements_as_text((By.CLASS_NAME, "master-slot"))
        )
        self.assertCountEqual(tt_name, self.get_timetable_name())
        return True

    def ptt_to_tuple(self):
        """Converts personal timetable to a tuple representation"""
        slots = self.get_elements_as_text((By.CLASS_NAME, "slot"))
        master_slots = self.get_elements_as_text((By.CLASS_NAME, "master-slot"))
        tt_name = self.get_timetable_name()
        return (slots, master_slots, tt_name)

    def get_elements_as_text(self, locator):
        """Gets elements using self.get and represents them as text"""
        try:
            eles = self.find(locator, get_all=True)
            elements = [s.text for s in eles if s.text]
            # Remove "Unlock this section" and "Lock this section" from text if present
            return list(
                map(
                    lambda s: "\n".join(
                        filter(
                            lambda l: not l.startswith("Unlock this section")
                            and not l.startswith("Lock this section"),
                            s.split("\n"),
                        )
                    ),
                    elements,
                )
            )
        except RuntimeError:
            return []

    def get_timetable_name(self):
        """Gets the personal timetable name"""
        return self.find((By.CLASS_NAME, "timetable-name")).get_property("value")

    def create_ptt(self, name: str = "", finish_saving: bool = True):
        """Create a personaltimetable with the provided name when provided

        Args:
            name: Name of the personal timetable
            finish_saving: Whether to wait until the personal timetable is saved
        """
        if finish_saving:
            self.assert_invisibility((By.CLASS_NAME, "unsaved"))
        self.find_element(
            By.XPATH, "//span[contains(@clas, 'tip-down')]"
        ).click().find_element(
            By.XPATH,
            "//button[contains(@class,'save-timetable') and contains(@class,'add-button')]",
        ).click()
        name_input = self.find((By.CLASS_NAME, "timetable-name"))
        WebDriverWait(self.driver, self.TIMEOUT).until(
            EC.text_to_be_present_in_element_value(
                (By.CLASS_NAME, "timetable-name"), "Untitled Schedule"
            )
        )
        if name:
            name_input.clear()
            name_input.send_keys(name)

    def create_friend(self, first_name, last_name, **kwargs):
        """Creates a friend of the primary (first) user"""
        user = User.objects.create(first_name=first_name, last_name=last_name)
        friend = Student.objects.create(
            user=user,
            img_url=self.get_test_url("jhu", path="static/img/user2-160x160.jpg"),
            **kwargs,
        )
        friend.friends.add(Student.objects.first())
        friend.save()
        return friend

    def create_personal_timetable_obj(self, friend, courses, semester):
        """Creates a personal timetable object belonging to the provided user
        with the given courses and semester"""
        ptt = PersonalTimetable.objects.create(student=friend, semester_id=semester.id)
        for course in courses:
            ptt.courses.add(course)
        ptt.save()
        return ptt

    def assert_login_button_found(self):
        self.find((By.CLASS_NAME, "social-login"), clickable=True)

    def assert_friend_image_found(self, friend):
        """Asserts that the provided friend's image is found on the page"""
        self.assert_n_elements_found((By.CLASS_NAME, "ms-friend"), 1)
        self.find(
            (
                By.XPATH,
                "//div[contains(@class,'ms-friend') and contains(@style,'%s')]"
                % friend.img_url,
            )
        )

    def assert_friend_in_modal(self, friend):
        """Asserts that the provided friend's image is found on the modal"""
        friend_div = self.assert_n_elements_found((By.CLASS_NAME, "friend"), 1)
        self.find(
            (
                By.XPATH,
                "//div[contains(@class,'ms-friend') and contains(@style,'%s')]"
                % friend.img_url,
            ),
            root=friend_div,
        )

    def switch_to_ptt(self, name):
        """Switches to the personal timetable with matching name"""
        self.find((By.CLASS_NAME, "timetable-drop-it-down")).click()
        self.find(
            (By.XPATH, "//div[@class='tt-name' and contains(text(),'%s')]" % name),
            clickable=True,
        ).click()
        self.find(
            (
                By.XPATH,
                "//input[contains(@class, 'timetable-name') and @value='%s']" % name,
            )
        )
        self.find((By.CLASS_NAME, "timetable-drop-it-down")).click()

    def toggle_custom_event_mode(self):
        self.find((By.CLASS_NAME, "fa-pencil")).click()

    def create_custom_event(
        self, day: int, start_time: int, end_time: int, show_weekend: bool = True
    ):
        """Creates a custom event using drag and drop assuming custom event mode is off

        Args:
            day: 0-6, 0 is Monday
            start_time: 0 is 0:00A.M, every 1 is 30 mins
            end_time: 0 is 0:00A.M, every 1 is 30 mins
            show_weekend: if weekends are shown
        """
        calendar_cells = self.find((By.CLASS_NAME, "cal-cell"), get_all=True)
        cells_per_row = 7 if show_weekend else 5
        start_cell = calendar_cells[day + (cells_per_row * start_time)]
        end_cell = calendar_cells[day + (cells_per_row * end_time)]

        self.toggle_custom_event_mode()
        # Magical code that simulates drag and drop because the driver doesn't work.
        self.driver.execute_script(
            "function createEvent(typeOfEvent) {\n"
            + 'var event = document.createEvent("CustomEvent");\n'
            + "event.initCustomEvent(typeOfEvent,true, true, null);\n"
            + "event.dataTransfer = {\n"
            + "data: {},\n"
            + "setData: function (key, value) {\n"
            + "this.data[key] = value;\n"
            + "},\n"
            + "getData: function (key) {\n"
            + "return this.data[key];\n"
            + "}\n"
            + "};\n"
            + "return event;\n"
            + "}\n"
            + "\n"
            + "function dispatchEvent(element, event,transferData) {\n"
            + "if (transferData !== undefined) {\n"
            + "event.dataTransfer = transferData;\n"
            + "}\n"
            + "if (element.dispatchEvent) {\n"
            + "element.dispatchEvent(event);\n"
            + "} else if (element.fireEvent) {\n"
            + 'element.fireEvent("on" + event.type, event);\n'
            + "}\n"
            + "}\n"
            + "\n"
            + "function simulateHTML5DragAndDrop(element, destination) {\n"
            + "var dragStartEvent =createEvent('dragstart');\n"
            + "dispatchEvent(element, dragStartEvent);\n"
            + "var dropEvent = createEvent('drop');\n"
            + "dispatchEvent(destination, dropEvent,dragStartEvent.dataTransfer);\n"
            + "var dragEndEvent = createEvent('dragend');\n"
            + "dispatchEvent(element, dragEndEvent,dropEvent.dataTransfer);\n"
            + "}\n"
            + "\n"
            + "var source = arguments[0];\n"
            + "var destination = arguments[1];\n"
            + "simulateHTML5DragAndDrop(source,destination);",
            start_cell,
            end_cell,
        )
        self.toggle_custom_event_mode()
        self.assert_invisibility(
            (
                By.XPATH,
                "//div[contains(@class, 'slot') and contains(@class, 'preview')]",
            ),
        )
        self.assert_loader_completes()

    def edit_custom_event(
        self,
        old_name: str,
        /,
        *,
        name: str = None,
        day: str = None,
        location: str = None,
        color: str = None,
        start_time: str = None,
        end_time: str = None,
        credits: float = None,
    ):
        """Edits the first custom event found with the provided name.

        Args:
            old_name: The name of the event to edit.
            name: The new name to give the event.
            day: The new day of the week, one of "M", "T", "W", "R", "F", "S", "U".
            location: The new location.
            color: The new color as a hex code (#FF0000).
            start_time: The new start time in military time (8:00).
            end_time: The new end time in military time (13:00).
            credits: The new number of credits.
        """
        slots: list[WebElement] = self.find((By.CLASS_NAME, "slot"), get_all=True)
        for slot in slots:
            if not slot.text.startswith(old_name):
                continue
            slot.click()
            if name is not None:
                event_name = self.find((By.ID, "event-name"))
                event_name.clear()
                event_name.send_keys(name)
            if day is not None:
                self.find((By.XPATH, f"//button[@name='{day}']")).click()
            if location is not None:
                event_location = self.find((By.ID, "event-location"))
                event_location.clear()
                event_location.send_keys(location)
            if color is not None:
                event_color = self.find((By.ID, "event-color"))
                event_color.clear()
                event_color.send_keys(color)
            if start_time is not None:
                event_start_time = self.find((By.ID, "event-start-time"))
                event_start_time.clear()
                event_start_time.send_keys(start_time)
            if end_time is not None:
                event_end_time = self.find((By.ID, "event-end-time"))
                event_end_time.clear()
                event_end_time.send_keys(end_time)
            if credits is not None:
                event_credits = self.find((By.ID, "event-credits"))
                event_credits.clear()
                event_credits.send_keys(str(credits))
            self.find((By.CLASS_NAME, "save-button")).click()
            return
        raise RuntimeError(
            f"Could not find event with name: {name}, day: {day}, location: {location},"
            f" color: {color}, start_time: {start_time}, end_time: {end_time},"
            f" credits: {credits}"
        )

    def assert_custom_event_exists(
        self,
        *,
        name: str,
        day: str = None,
        location: str = None,
        color: str = None,
        start_time: str = None,
        end_time: str = None,
        credits: float = None,
    ):
        """Asserts that a custom event with the provided fields exists in the current
        timetable.

        Args:
            name: Name of the event, can be substring of the actual name
            day: Day of the week, one of "M", "T", "W", "R", "F", "S", "U"
            location: Location of the event, can be substring of the actual name
            color: Color of the event in hex (#F8F6F7), case insensitive
            start_time: Start time of the event as a non zero-padded string (8:00)
            end_time: End time of the event as a non zero-padded string (14:30)
            credits: Number of credits of the event

        Raises:
            RuntimeError: If the event could not be found.
        """
        x, y = self.find((By.CLASS_NAME, "semesterly-name")).location.values()
        slots: list[WebElement] = self.find((By.CLASS_NAME, "slot"), get_all=True)
        for slot in slots:
            if not slot.text.startswith(name):
                continue
            slot.click()
            (
                event_name,
                event_day,
                event_location,
                event_color,
                event_start_time,
                event_end_time,
                event_credits,
            ) = self.get_custom_event_fields()

            # close modal
            ActionChains(self.driver).move_by_offset(x, y).click().perform()
            if (
                event_name.startswith(name)
                and (not day or event_day.startswith(day))
                and (not location or event_location.startswith(location))
                and (not color or event_color.lower() == color.lower())
                and (not start_time or event_start_time == start_time)
                and (not end_time or event_end_time == end_time)
                and (not credits or float(event_credits) == credits)
            ):
                return

        raise RuntimeError(
            f"Could not find event with name: {name}, day: {day}, location: {location},"
            f" color: {color}, start_time: {start_time}, end_time: {end_time},"
            f" credits: {credits}"
        )

    def get_custom_event_fields(self):
        """Returns the fields of the currently selected custom event.

        Pre-condition:
            Custom event modal is open.
        """
        event_name = self.find((By.ID, "event-name")).get_property("value")
        event_day = self.find((By.XPATH, "//button[@class='active']")).get_property(
            "name"
        )
        event_location = self.find((By.ID, "event-location")).get_property("value")
        event_color = self.find((By.ID, "event-color")).get_property("value")
        event_start_time = self.find((By.ID, "event-start-time")).get_property("value")
        event_end_time = self.find((By.ID, "event-end-time")).get_property("value")
        event_credits = self.find((By.ID, "event-credits")).get_property("value")

        return (
            event_name,
            event_day,
            event_location,
            event_color,
            event_start_time,
            event_end_time,
            event_credits,
        )

    def compare_timetable(self, timetable_name: str):
        """Activates the compare timetable mode with a timetable of the given name.

        Args:
            timetable_name: Name of the timetable to compare to, must already exist.

        Pre-condition:
            The timetable dropdown is not clicked.
        """
        self.find((By.CLASS_NAME, "timetable-drop-it-down")).click()
        row = self.find(
            (
                By.XPATH,
                "//div[@class='tt-name' and contains(text(),'%s')]" % timetable_name,
            )
        )
        self.find(
            (By.CLASS_NAME, "fa-arrows-left-right"), root=row, clickable=True
        ).click()

    def exit_compare_timetable(self):
        """Exits the compare timetable mode (pre: already in compare timetable mode)"""
        self.find((By.CLASS_NAME, "compare-timetable-exit")).click()


class url_matches_regex:
    """Expected Condition which waits until the browser's url matches the provided regex"""

    def __init__(self, pattern):
        self.pattern = re.compile(pattern)

    def __call__(self, driver):
        res = self.pattern.search(driver.current_url)
        if res:
            return res
        else:
            return False


class text_to_be_present_in_element_attribute:
    """
    An expectation for checking if the given text is present in the element's
    locator, text
    """

    def __init__(self, locator, text_, attribute_):
        self.locator = locator
        self.text = text_
        self.attribute = attribute_

    def __call__(self, driver):
        try:
            element_text = driver.find_element(*self.locator).get_attribute(
                self.attribute
            )
            if element_text:
                return self.text in element_text
            else:
                return False
        except StaleElementReferenceException:
            return False


class text_to_be_present_in_nth_element:
    """
    An expectation for checking if the given text is present in the nth element's
    locator, text
    """

    def __init__(self, locator, text_, index_):
        self.locator = locator
        self.text = text_
        self.index = index_

    def __call__(self, driver):
        try:
            element = driver.find_elements(*self.locator)[self.index]
            if element.text and self.text in element.text:
                return element
            else:
                return False
        except StaleElementReferenceException:
            return False


class n_elements_to_be_found:
    """
    An expectation for checking if the n elements are found
    locator, text
    """

    def __init__(self, locator, n_):
        self.locator = locator
        self.n_found = n_

    def __call__(self, driver):
        try:
            eles_found = driver.find_elements(*self.locator)
            if len(eles_found) == self.n_found:
                return True
            else:
                return False
        except StaleElementReferenceException:
            return False


class function_returns_true:
    """
    An expectation for checking if the provided function returns true
    """

    def __init__(self, func):
        self.function = func

    def __call__(self, driver):
        try:
            return self.function()
        except:
            return False


def force_login(user, driver, base_url):
    """Forces the login of the provided user setting all cookies.
    Function will refresh the provided drivfer and the user will be logged in to that session.
    """
    from django.conf import settings

    session_store = import_module(settings.SESSION_ENGINE).SessionStore
    driver.get(base_url)

    session = session_store()
    session[SESSION_KEY] = user.id
    session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[0]
    session[HASH_SESSION_KEY] = user.get_session_auth_hash()
    session.save()

    domain = base_url.split(":")[-2].split("/")[-1]
    cookie = {
        "name": settings.SESSION_COOKIE_NAME,
        "value": session.session_key,
        "path": "/",
        "secure": False,
        "domain": domain,
    }

    driver.add_cookie(cookie)
    # hack to get past authentication errors
    driver.add_cookie({"name": "csrftoken", "value": session.session_key})
    driver.refresh()
