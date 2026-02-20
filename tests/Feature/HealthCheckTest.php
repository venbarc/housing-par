<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_application_boots_in_testing_environment(): void
    {
        $this->assertTrue(app()->environment('testing'));
    }
}
