<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'user_type' => $this->user_type,
            'email' => $this->email,
            'password' => $this->password,
            'username' => $this->username,
            'blocked' => $this->blocked,
            'photo_url' => $this->photo_url,
            'phone_number' => $this->phone_number,
        ];
    }
}
