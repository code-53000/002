<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_no', 50)->unique();
            $table->string('laundry_partner', 100);
            $table->string('laundry_contact', 20)->nullable();
            $table->timestamp('received_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('total_count')->default(0);
            $table->integer('cleaned_count')->default(0);
            $table->integer('damaged_count')->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('washing_method')->nullable();
            $table->string('disinfection_method', 100)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaning_batches');
    }
};
