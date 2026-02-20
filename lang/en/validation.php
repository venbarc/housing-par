<?php

return [
    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute field must be a valid email address.',
    'min' => [
        'string' => 'The :attribute field must be at least :min characters.',
    ],
    'max' => [
        'string' => 'The :attribute field must not be greater than :max characters.',
        'file' => 'The :attribute field must not be greater than :max kilobytes.',
    ],
    'unique' => 'The :attribute has already been taken.',
    'confirmed' => 'The :attribute field confirmation does not match.',
    'in' => 'The selected :attribute is invalid.',
    'exists' => 'The selected :attribute is invalid.',
    'integer' => 'The :attribute field must be an integer.',
    'numeric' => 'The :attribute field must be a number.',
    'date' => 'The :attribute field must be a valid date.',
    'file' => 'The :attribute field must be a file.',
    'attributes' => [],
];
